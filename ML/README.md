# FraudShield ML experiments

This directory contains the standalone transaction-graph experiments. They link senders to devices, IP addresses, and products, generate Node2Vec embeddings, and compare anomaly candidates from Isolation Forest and DBSCAN.

Run from this directory after installing the pinned dependencies into a virtual environment. The bundled example uses fictional identifiers and documentation-only IP addresses. Run `python main.py example_transactions.csv` to exercise the pipeline. To use your own reviewed synthetic dataset, pass its path or use the default filename `Synthetic_Transaction_Dataset.csv`. The graph builder reads `sender`, `created_at`, `device_id`, `ip_address`, `product_name`, and `amount`.

The script writes `anomalies_iforest.txt` and `anomalies_dbscan.txt` to the current directory.
