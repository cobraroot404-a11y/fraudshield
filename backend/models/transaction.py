from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionCreate(BaseModel):
    amount: float
    sender: str
    receiver: str
    location: Optional[str] = None
    ip_address: Optional[str] = None
    device_id: Optional[str] = None

class TransactionOut(TransactionCreate):
    id: str
    status: str
    risk_score: float
    flagged: bool
    created_at: datetime
    ml_flagged: Optional[bool] = False
    ml_reason: Optional[str] = None
