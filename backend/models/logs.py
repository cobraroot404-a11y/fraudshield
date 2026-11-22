from pydantic import BaseModel
from datetime import datetime
class LogEntry(BaseModel):
    user_email: str
    action: str
    target: str
    timestamp: datetime
    meta: dict = {}