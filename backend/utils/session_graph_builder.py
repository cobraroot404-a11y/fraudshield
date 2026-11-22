import pandas as pd
import networkx as nx
from datetime import timedelta

def load_and_process(filepath):
    df = pd.read_csv(filepath)
    df['created_at'] = pd.to_datetime(df['created_at'])
    df = df.sort_values(by=['sender', 'created_at'])

    df['session_id'] = (df.groupby('sender')['created_at']
                          .diff().gt(timedelta(minutes=30))
                          .cumsum()
                          .fillna(0)
                          .astype(int))
    return df

def build_graph(df):
    G = nx.Graph()
    for _, row in df.iterrows():
        sender = row.get('sender')
        device = row.get('device_id')
        ip = row.get('ip_address')
        amount = row.get('amount')
        timestamp = row.get('created_at')
        session = row.get('session_id', None)
        product = row.get('product_name', None)

        G.add_node(sender, type='user')
        if device: G.add_node(device, type='device')
        if ip: G.add_node(ip, type='ip')
        if product: G.add_node(product, type='product')

        if sender and device:
            G.add_edge(sender, device, edge_type='used_device', weight=1, session=session, amount=amount, timestamp=timestamp)
        if sender and ip:
            G.add_edge(sender, ip, edge_type='used_ip', weight=1, session=session, timestamp=timestamp)
        if sender and product:
            G.add_edge(sender, product, edge_type='bought_product', weight=1, session=session, timestamp=timestamp)
    return G


def extract_node_features(df):
    session_counts = df.groupby('sender')['session_id'].nunique().rename("session_count")
    avg_txn_per_session = (df.groupby(['sender', 'session_id'])
                             .size()
                             .groupby('sender')
                             .mean()
                             .rename("avg_txn_per_session"))
    node_features = pd.concat([session_counts, avg_txn_per_session], axis=1).fillna(0)
    return node_features
