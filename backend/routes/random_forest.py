from functools import lru_cache
import os

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, AwareDatetime, Field
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder

from utils.auth import require_role

router = APIRouter(dependencies=[Depends(require_role(["admin", "analyst"]))])
NUMERIC = ["amount", "hour", "weekday"]
CATEGORICAL = ["currency", "product_name"]


class ScoreRequest(BaseModel):
    amount: float = Field(gt=0, allow_inf_nan=False)
    currency: str = Field(min_length=3, max_length=3, pattern=r"^[A-Z]+$")
    product_name: str = Field(min_length=1, max_length=100)
    created_at: AwareDatetime


class AdvisoryScore(BaseModel):
    flagged: bool
    probability: float


def features(rows: pd.DataFrame) -> pd.DataFrame:
    timestamps = pd.to_datetime(rows["created_at"], utc=True, errors="raise")
    return rows.assign(hour=timestamps.dt.hour, weekday=timestamps.dt.weekday)[NUMERIC + CATEGORICAL]


@lru_cache(maxsize=1)
def train(dataset: str):
    rows = pd.read_csv(dataset, nrows=10_001)
    labels = rows["flagged"].map({True: 1, False: 0, 1: 1, 0: 0})
    if len(rows) > 10_000 or labels.isna().any() or set(labels) != {0, 1}:
        raise ValueError("Expected up to 10,000 labeled rows with both classes")
    encoder = ColumnTransformer([
        ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
        ("numeric", "passthrough", NUMERIC),
    ])
    classifier = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=1)
    return make_pipeline(encoder, classifier).fit(features(rows), labels)


@router.post("/score", response_model=AdvisoryScore)
def score(request: ScoreRequest):
    dataset = os.getenv("FRAUDSHIELD_FOREST_DATASET")
    if not dataset:
        raise HTTPException(503, "Random Forest training data is not configured")
    try:
        model = train(dataset)
    except (OSError, ValueError, KeyError):
        raise HTTPException(503, "Random Forest training data could not be used") from None
    row = features(pd.DataFrame([request.model_dump()]))
    probability = model.predict_proba(row)[0][list(model.classes_).index(1)]
    return AdvisoryScore(flagged=bool(model.predict(row)[0]), probability=float(probability))
