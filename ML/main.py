from session_graph_builder import load_and_process, build_graph, extract_node_features
from embed import generate_node2vec_embeddings
from anomaly_detector import detect_anomalies_iforest, detect_anomalies_dbscan
from argparse import ArgumentParser
from pathlib import Path

if __name__ == "__main__":
    parser = ArgumentParser(description="Run transaction-graph anomaly detection.")
    parser.add_argument("dataset", type=Path, nargs="?", default=Path("Synthetic_Transaction_Dataset.csv"))
    filepath = parser.parse_args().dataset

    df = load_and_process(filepath)
    G = build_graph(df)
    features = extract_node_features(df)

    print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    print("Features:\n", features.head())

    X, labels = generate_node2vec_embeddings(G)
    print(f"Embeddings: {X.shape}")

    # Isolation Forest
    anomalies_iforest, scores = detect_anomalies_iforest(X, labels)
    print(f"Isolation Forest flagged: {len(anomalies_iforest)} nodes")

    # DBSCAN
    anomalies_dbscan, db_labels = detect_anomalies_dbscan(X, labels)
    print(f"DBSCAN flagged: {len(anomalies_dbscan)} nodes")

    # Save results
    with open("anomalies_iforest.txt", "w") as f:
        f.writelines([str(a) + "\n" for a in anomalies_iforest])

    with open("anomalies_dbscan.txt", "w") as f:
        f.writelines([str(a) + "\n" for a in anomalies_dbscan])
