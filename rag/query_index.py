import argparse
import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


def load_store(store_dir: Path):
    index = faiss.read_index(str(store_dir / "index.faiss"))

    with open(store_dir / "chunks.json", "r", encoding="utf-8") as handle:
        chunks = json.load(handle)

    with open(store_dir / "config.json", "r", encoding="utf-8") as handle:
        config = json.load(handle)

    return index, chunks, config


def query(store_dir: Path, user_query: str, k: int = 5):
    index, chunks, config = load_store(store_dir)
    model = SentenceTransformer(config.get("model", "all-MiniLM-L6-v2"))

    query_vec = model.encode([user_query])
    query_vec = np.asarray(query_vec, dtype="float32")

    distances, indices = index.search(query_vec, k=k)

    results = []
    for rank, (idx, dist) in enumerate(zip(indices[0], distances[0]), start=1):
        if idx < 0 or idx >= len(chunks):
            continue
        item = chunks[idx]
        results.append(
            {
                "rank": rank,
                "distance": float(dist),
                "url": item.get("url", ""),
                "text": item.get("text", ""),
            }
        )

    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Query local FAISS index")
    parser.add_argument("query", help="Question to search for")
    parser.add_argument("--store", default="rag/store")
    parser.add_argument("--k", type=int, default=5)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    results = query(Path(args.store), args.query, k=args.k)
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
