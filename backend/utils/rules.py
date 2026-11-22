def evaluate_transaction(tx: dict) -> dict:
    score = 0
    reasons = []

    if tx["amount"] > 10000:
        score += 50
        reasons.append("High amount")

    if tx.get("location") not in ["India", "US", "UK"]:
        score += 25
        reasons.append("Unusual location")

    if tx.get("ip_address", "").startswith("192.") is False:
        score += 15
        reasons.append("Suspicious IP")

    flagged = score >= 50
    return {"risk_score": score, "flagged": flagged, "status": "flagged" if flagged else "approved", "reasons": reasons}
