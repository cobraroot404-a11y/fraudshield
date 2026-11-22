import json
import os
from pathlib import Path
import subprocess
from threading import Lock

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, ValidationError

from utils.auth import require_role

router = APIRouter(dependencies=[Depends(require_role(["admin", "analyst"]))])
MAX_UPLOAD = 2 * 1024 * 1024
WORKER = Path(__file__).resolve().parents[1] / "ocr" / "worker.py"
scan_lock = Lock()


class Receipt(BaseModel):
    merchant: str | None
    amount: float | None


@router.post("/scan", response_model=Receipt)
def scan_document(file: UploadFile = File(...)):
    python = os.getenv("FRAUDSHIELD_OCR_PYTHON")
    models = os.getenv("FRAUDSHIELD_OCR_MODELS")
    if not python or not models:
        raise HTTPException(503, "Receipt scanning is not configured")
    if file.content_type not in {"image/png", "image/jpeg"}:
        raise HTTPException(415, "Provide a PNG or JPEG receipt")
    data = file.file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Receipt exceeds 2 MiB")
    if not scan_lock.acquire(blocking=False):
        raise HTTPException(429, "Receipt scanner is busy")
    try:
        result = subprocess.run(
            [python, str(WORKER), models],
            input=data, capture_output=True, timeout=60, check=False,
        )
        if result.returncode == 2:
            raise HTTPException(422, "Invalid receipt image")
        if result.returncode != 0:
            raise HTTPException(503, "Receipt scanner is unavailable")
        return Receipt.model_validate(json.loads(result.stdout))
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Receipt scan timed out") from None
    except (OSError, ValueError, ValidationError):
        raise HTTPException(503, "Receipt scanner is unavailable") from None
    finally:
        scan_lock.release()
