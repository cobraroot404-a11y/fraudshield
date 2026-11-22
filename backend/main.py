import os
from fastapi import FastAPI
from routes import auth, transaction
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/auth")
app.include_router(transaction.router, prefix="/transactions")

if os.getenv("FRAUDSHIELD_FOREST_DATASET"):
    from routes import random_forest
    app.include_router(random_forest.router, prefix="/ml/random-forest")

if os.getenv("FRAUDSHIELD_OCR_PYTHON"):
    from routes import receipt
    app.include_router(receipt.router, prefix="/ocr")
