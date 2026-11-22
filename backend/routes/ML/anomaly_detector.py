from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
import numpy as np

def detect_anomalies_iforest(X, labels, contamination=0.05):
    model = IsolationForest(contamination=contamination, random_state=42)
    preds = model.fit_predict(X)

    anomalies = [labels[i] for i in range(len(preds)) if preds[i] == -1]
    scores = model.decision_function(X)

    return anomalies, scores

def detect_anomalies_dbscan(X, labels, eps=0.5, min_samples=5):
    db = DBSCAN(eps=eps, min_samples=min_samples).fit(X)
    preds = db.labels_

    anomalies = [labels[i] for i in range(len(preds)) if preds[i] == -1]
    return anomalies, preds
