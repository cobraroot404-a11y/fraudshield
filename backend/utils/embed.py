import numpy as np
from node2vec import Node2Vec

def generate_node2vec_embeddings(G, dimensions=64, walk_length=10, num_walks=100, window=5):
    node2vec = Node2Vec(G, dimensions=dimensions, walk_length=walk_length,
                        num_walks=num_walks, workers=2)
    model = node2vec.fit(window=window, min_count=1)

    embeddings, labels = [], []
    for node in G.nodes():
        embeddings.append(model.wv[node])
        labels.append(node)

    X = np.array(embeddings)
    return X, labels
