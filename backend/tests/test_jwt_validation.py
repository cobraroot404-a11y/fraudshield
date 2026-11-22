from datetime import datetime, timedelta, timezone
import os
from secrets import token_urlsafe
import unittest
from unittest.mock import patch

from fastapi import HTTPException
import jwt

os.environ.setdefault("MONGO_URI", "mongodb://127.0.0.1:27029")
os.environ.setdefault("SECRET_KEY", token_urlsafe(32))
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

from utils import auth


class JwtValidationTests(unittest.TestCase):
    def setUp(self):
        self.claims = {
            "sub": "reviewer@example.com",
            "role": "analyst",
            "exp": int((datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp()),
        }

    def assert_rejected(self, token):
        with self.assertRaises(HTTPException) as error:
            auth.get_current_user(token)
        self.assertEqual(error.exception.status_code, 401)
        self.assertEqual(error.exception.headers, {"WWW-Authenticate": "Bearer"})

    def test_issued_token_preserves_subject_and_role(self):
        token = auth.create_access_token({"sub": self.claims["sub"], "role": self.claims["role"]})
        self.assertEqual(auth.get_current_user(token), {"email": self.claims["sub"], "role": "analyst"})

    def test_accepts_token_issued_by_previous_library(self):
        # Fixture issued by python-jose 3.5.0 for a synthetic account.
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZXZpZXdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJhbmFseXN0IiwiZXhwIjo0MTAyNDQ0ODAwfQ.N_XagOiJn9-uvkyAkaszNjxQBRi_bRfx5UtPWTb2kU8"
        with patch.object(auth, "SECRET_KEY", "fraudshield-disposable-legacy-test-key-only-000"):
            self.assertEqual(auth.get_current_user(token), {"email": self.claims["sub"], "role": "analyst"})

    def test_rejects_invalid_signature(self):
        self.assert_rejected(jwt.encode(self.claims, token_urlsafe(32), algorithm="HS256"))

    def test_rejects_unsupported_algorithm(self):
        self.assert_rejected(jwt.encode(self.claims, token_urlsafe(64), algorithm="HS384"))

    def test_rejects_expired_token(self):
        token = auth.create_access_token(self.claims, expires_delta=timedelta(minutes=-1))
        self.assert_rejected(token)

    def test_rejects_malformed_claims(self):
        for invalid in (
            {"sub": 123}, {"sub": ""}, {"sub": " "}, {"role": ["analyst"]},
            {"role": "unknown"}, {"role": None}, {"exp": None},
            {"exp": str(self.claims["exp"])},
        ):
            with self.subTest(invalid=invalid):
                self.assert_rejected(jwt.encode({**self.claims, **invalid}, auth.SECRET_KEY, algorithm="HS256"))
        for missing in ("sub", "exp", "role"):
            with self.subTest(missing=missing):
                claims = {key: value for key, value in self.claims.items() if key != missing}
                self.assert_rejected(jwt.encode(claims, auth.SECRET_KEY, algorithm="HS256"))

    def test_rejects_audience_claim_without_configured_audience(self):
        token = jwt.encode({**self.claims, "aud": "other-service"}, auth.SECRET_KEY, algorithm="HS256")
        self.assert_rejected(token)
