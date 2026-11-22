import os
import re
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
if ALGORITHM != "HS256":
    raise ValueError("FraudShield requires HS256")
if not SECRET_KEY or not re.fullmatch(r"[A-Za-z0-9_-]{43,}", SECRET_KEY):
    raise ValueError("Set SECRET_KEY to an independently generated URL-safe signing secret of at least 43 characters")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

mongo_uri = os.getenv("MONGO_URI")
if sys.version_info < (3, 11) and mongo_uri and mongo_uri.lower().startswith("mongodb+srv://"):
    raise ValueError("MongoDB SRV requires Python 3.11 or newer with the patched DNS dependency")
client = MongoClient(mongo_uri)
db = client["fraudshield"]
