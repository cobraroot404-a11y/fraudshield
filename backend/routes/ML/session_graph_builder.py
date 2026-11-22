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
        sender = row['sender']
        device = row['device_id']
        ip = row['ip_address']
        product = row['product_name']
        session = row['session_id']
        amount = row['amount']
        timestamp = row['created_at']

        G.add_node(sender, type='user')
        G.add_node(device, type='device')
        G.add_node(ip, type='ip')
        G.add_node(product, type='product')

        G.add_edge(sender, device, edge_type='used_device', weight=1, session=session, amount=amount, timestamp=timestamp)
        G.add_edge(sender, ip, edge_type='used_ip', weight=1, session=session, timestamp=timestamp)
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
