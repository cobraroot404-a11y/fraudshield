from fastapi import APIRouter, Depends
from models.transaction import TransactionCreate, TransactionOut
from utils.rules import evaluate_transaction
from config import db
from fastapi import HTTPException
from datetime import datetime
from bson import ObjectId
from fastapi import Query
from utils.auth import require_role
import pandas as pd
from utils.session_graph_builder import build_graph
from utils.embed import generate_node2vec_embeddings
from utils.anomaly_detector import detect_anomalies_iforest
from typing import List
#from models.transaction import TransactionOut
router = APIRouter(dependencies=[Depends(require_role(["admin", "analyst", "viewer"]))])
tx_col = db["transactions"]
from models.logs import LogEntry


import pandas as pd
from threading import Lock

cached_df = None
cache_lock = Lock()

@router.post("/", response_model=TransactionOut, dependencies=[Depends(require_role(["admin", "analyst"]))])
def create_transaction(tx: TransactionCreate):
    global cached_df

    tx_data = tx.dict()
    tx_data["created_at"] = datetime.utcnow()

    # Lock to avoid race conditions in async requests
    with cache_lock:
        if cached_df is None:
            docs = list(tx_col.find({}, {
                "amount": 1, "sender": 1, "receiver": 1,
                "location": 1, "ip_address": 1,
                "device_id": 1, "created_at": 1,
                "product_name": 1
            }))
            cached_df = pd.DataFrame(docs)

        # Append new tx to cached_df
        new_tx_df = pd.DataFrame([tx_data])
        prospective_df = pd.concat([cached_df, new_tx_df], ignore_index=True)

        # Build graph + run anomaly detection
        G = build_graph(prospective_df)
        X, labels = generate_node2vec_embeddings(G)
        anomalies, _ = detect_anomalies_iforest(X, labels)

        is_anomaly = tx_data["sender"] in anomalies
        tx_data["ml_flagged"] = is_anomaly
        tx_data["ml_reason"] = "Detected by IsolationForest" if is_anomaly else None

        tx_data.update(evaluate_transaction(tx_data))

        res = tx_col.insert_one(tx_data)
        cached_df = prospective_df
    tx_data["id"] = str(res.inserted_id)

    return TransactionOut(**tx_data)


def fetch_all_transactions():
    docs = list(tx_col.find({}, {
        "amount": 1, "sender": 1, "receiver": 1,
        "location": 1, "ip_address": 1,
        "device_id": 1, "created_at": 1,
        "product_name": 1
    }))
    return pd.DataFrame(docs)
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from datetime import datetime

# ...your existing imports...

@router.get("/stats/monthly")
def get_monthly_stats(user=Depends(require_role(["admin", "analyst", "viewer"]))):
    # Group by month
    pipeline = [
        {
            "$group": {
                "_id": {
                    "month": { "$month": "$created_at" },
                    "year": { "$year": "$created_at" }
                },
                "total": { "$sum": 1 },
                "flagged": { "$sum": { "$cond": ["$flagged", 1, 0] } }
            }
        },
        { "$sort": { "_id.year": 1, "_id.month": 1 } }
    ]
    data = list(tx_col.aggregate(pipeline))
    # Convert to frontend shape
    month_map = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    result = []
    for x in data:
        m = x["_id"]["month"]
        y = x["_id"]["year"]
        result.append({
            "month": f"{month_map[m-1]}",  # If you want year as well, use: f"{month_map[m-1]} {y}"
            "total": x["total"],
            "flagged": x["flagged"]
        })
    return result

@router.get("/stats/risk_distribution")
def risk_distribution():
    buckets = [
        {"name": "Low Risk", "min": 0, "max": 40},
        {"name": "Medium Risk", "min": 41, "max": 70},
        {"name": "High Risk", "min": 71, "max": 100},
    ]
    result = []
    for b in buckets:
        count = tx_col.count_documents({
            "risk_score": {"$gte": b["min"], "$lte": b["max"]}
        })
        result.append({"name": b["name"], "value": count})
    print(result)  # Debug
    return result
@router.get("/stats/top_senders")
def get_top_senders(limit: int = 5, user=Depends(require_role(["admin", "analyst"]))):
    pipeline = [
        {"$group": {"_id": "$sender", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    data = list(tx_col.aggregate(pipeline))
    return [
        {"sender": doc["_id"], "count": doc["count"]}
        for doc in data
    ]

@router.get("/export")
def export_transactions_csv(user=Depends(require_role(["admin", "analyst", "viewer"]))):
    # Get all transactions
    docs = list(tx_col.find())
    for doc in docs:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
    df = pd.DataFrame(docs)
    # Safety: remove binary/large/unneeded fields if any
    if "ml_reason" in df.columns:
        df["ml_reason"] = df["ml_reason"].astype(str)
    # Dump CSV
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    return StreamingResponse(stream, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=transactions.csv"
    })

@router.get("/flagged", response_model=List[TransactionOut])
def get_flagged_transactions(limit: int = 50, user=Depends(require_role(["admin", "analyst"]))):
    results = tx_col.find({"flagged": True}).sort("created_at", -1).limit(limit)
    return [
        TransactionOut(
            id=str(tx["_id"]),
            amount=tx["amount"],
            sender=tx["sender"],
            receiver=tx["receiver"],
            location=tx.get("location"),
            ip_address=tx.get("ip_address"),
            device_id=tx.get("device_id"),
            status=tx["status"],
            risk_score=tx["risk_score"],
            flagged=tx["flagged"],
            created_at=tx["created_at"],
        ) for tx in results
    ]


@router.get("/all", response_model=List[TransactionOut])
def get_all_transactions(limit: int = 100, user=Depends(require_role(["admin", "analyst", "viewer"]))):
    results = tx_col.find().sort("created_at", -1).limit(limit)
    return [TransactionOut(
        id=str(tx["_id"]),
        amount=tx["amount"],
        sender=tx["sender"],
        receiver=tx["receiver"],
        location=tx.get("location"),
        ip_address=tx.get("ip_address"),
        device_id=tx.get("device_id"),
        status=tx["status"],
        risk_score=tx["risk_score"],
        flagged=tx["flagged"],
        created_at=tx["created_at"],
    ) for tx in results]
from fastapi import Path

@router.get("/{id}", response_model=TransactionOut)
def get_transaction(id: str = Path(...)):
    tx = tx_col.find_one({"_id": ObjectId(id)})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return TransactionOut(
        id=str(tx["_id"]),
        amount=tx["amount"],
        sender=tx["sender"],
        receiver=tx["receiver"],
        location=tx.get("location"),
        ip_address=tx.get("ip_address"),
        device_id=tx.get("device_id"),
        status=tx["status"],
        risk_score=tx["risk_score"],
        flagged=tx["flagged"],
        created_at=tx["created_at"],
    )
from fastapi import Body

# Only admin or analyst can update
@router.patch("/{id}/status")
def update_transaction_status(
    id: str, status: str = Body(..., embed=True),
    user=Depends(require_role(["admin", "analyst"]))
    ):
    if status not in ["approved", "blocked", "false_positive"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = tx_col.update_one({"_id": ObjectId(id)}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found or no change")
    return {"message": "Status updated", "id": id, "new_status": status}

@router.get("/dashboard/summary")
def get_summary():
    total = tx_col.count_documents({})
    flagged = tx_col.count_documents({"flagged": True})
    avg_score = tx_col.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ])
    avg = next(avg_score, {}).get("avg", 0)
    return {
        "total_transactions": total,
        "flagged_transactions": flagged,
        "avg_risk_score": round(avg, 2)
    }

@router.post("/manual-approval")
def manually_approve_or_block(tx_id: str, decision: str = Body(...), user=Depends(require_role(["admin"]))):
    if decision not in ["approve", "block"]:
        raise HTTPException(status_code=400, detail="Invalid decision")
    if not ObjectId.is_valid(tx_id):
        raise HTTPException(status_code=400, detail="Invalid transaction ID")
    status = "approved" if decision == "approve" else "blocked"
    result = tx_col.update_one(
        {"_id": ObjectId(tx_id)},
        {"$set": {"status": status, "flagged": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": f"Transaction {status} manually", "id": tx_id}

from fastapi.responses import StreamingResponse
import io
