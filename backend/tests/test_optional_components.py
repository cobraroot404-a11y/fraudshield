from datetime import datetime, timezone
from io import BytesIO
import os
from secrets import token_urlsafe
from pathlib import Path
from subprocess import CompletedProcess
import unittest
from unittest.mock import patch
from types import SimpleNamespace

from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

os.environ.setdefault("MONGO_URI", "mongodb://127.0.0.1:27029")
os.environ.setdefault("SECRET_KEY", token_urlsafe(32))
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

from ocr.worker import extract
from routes import random_forest, receipt, transaction

DATASET = Path(__file__).resolve().parents[2] / "ML" / "example_forest_training.csv"


def upload(content, content_type="image/png"):
    return UploadFile(BytesIO(content), headers=Headers({"content-type": content_type}))


class RandomForestTests(unittest.TestCase):
    def test_unseen_product_returns_advisory_probability(self):
        with patch.dict(os.environ, {"FRAUDSHIELD_FOREST_DATASET": str(DATASET)}):
            result = random_forest.score(random_forest.ScoreRequest(
                amount=45, currency="EUR", product_name="unseen",
                created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            ))
        self.assertIsInstance(result.flagged, bool)
        self.assertTrue(0 <= result.probability <= 1)

    def test_status_is_not_a_training_feature(self):
        model = random_forest.train(str(DATASET))
        self.assertNotIn("status", model.feature_names_in_)


class ReceiptTests(unittest.TestCase):
    def setUp(self):
        env = patch.dict(os.environ, {"FRAUDSHIELD_OCR_PYTHON": "python", "FRAUDSHIELD_OCR_MODELS": "models"})
        env.start()
        self.addCleanup(env.stop)

    def test_extraction_uses_labeled_total(self):
        result = extract(["Example Shop", "Subtotal 90.00", "Cash 100.00", "Total 42.50"])
        self.assertEqual(result, {"merchant": "Example Shop", "amount": 42.5})

    def test_extraction_ignores_subtotal_only(self):
        self.assertIsNone(extract(["Example Shop", "Subtotal 90.00"])["amount"])

    def test_unsupported_media_is_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            receipt.scan_document(upload(b"data", "text/plain"))
        self.assertEqual(caught.exception.status_code, 415)

    def test_oversized_upload_is_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            receipt.scan_document(upload(b"x" * (receipt.MAX_UPLOAD + 1)))
        self.assertEqual(caught.exception.status_code, 413)

    def test_worker_error_does_not_leak_stderr(self):
        with patch.object(receipt.subprocess, "run", return_value=CompletedProcess([], 1, b"", b"internal detail")):
            with self.assertRaises(HTTPException) as caught:
                receipt.scan_document(upload(b"data"))
        self.assertEqual(caught.exception.status_code, 503)
        self.assertNotIn("internal detail", caught.exception.detail)

    def test_worker_result_contains_only_receipt_fields(self):
        payload = b'{"merchant":"Example Shop","amount":42.50,"raw_text":["discard"]}'
        with patch.object(receipt.subprocess, "run", return_value=CompletedProcess([], 0, payload, b"")):
            result = receipt.scan_document(upload(b"data"))
        self.assertEqual(result.model_dump(), {"merchant": "Example Shop", "amount": 42.5})


class ManualReviewTests(unittest.TestCase):
    def test_admin_decision_writes_transaction_status(self):
        tx_id = "000000000000000000000001"
        with patch.object(transaction.tx_col, "update_one", return_value=SimpleNamespace(matched_count=1)) as update:
            result = transaction.manually_approve_or_block(tx_id, "approve", user={"role": "admin"})
        self.assertEqual(result["id"], tx_id)
        self.assertEqual(update.call_args.args[1], {"$set": {"status": "approved", "flagged": False}})
