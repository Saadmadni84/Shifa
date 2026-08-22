"""
evaluation/experiments/experiment1_retrieval.py

Experiment 1 — Retrieval method comparison.

Compares BM25 (sparse), Dense (semantic) and Hybrid (RRF fusion) retrieval
on the same chunked corpus and the same question set, reporting
Recall@5, Recall@10, Precision@5, Precision@10, MRR and nDCG@10.

Controls: chunk size (512 tokens), embedding model (MiniLM).
"""
from __future__ import annotations

from typing import Dict, List

from evaluation.experiments.common import (
    DEFAULT_CHUNK_SIZE,
    DEFAULT_EMBEDDING_MODEL,
    build_chunks,
    build_retriever,
    make_retrieve_fn,
)
from evaluation.metrics.retrieval_metrics import evaluate_retrieval


def run(
    corpus: List[dict],
    questions: List[dict],
    methods: List[str],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    max_queries: int = 0,
) -> Dict:
    """Run Experiment 1 and return structured results."""
    chunks = build_chunks(corpus, chunk_size=chunk_size)
    queries = questions[:max_queries] if max_queries else questions

    results: Dict[str, Dict] = {}
    subsets_out: Dict[str, Dict] = {}
    for method in methods:
        retriever = build_retriever(method, chunks, model_name=model_name)
        retrieve_fn = make_retrieve_fn(retriever)
        eval_out = evaluate_retrieval(queries, retrieve_fn)
        results[method] = eval_out
        subsets_out[method] = evaluate_subsets(queries, retrieve_fn)

    return {
        "experiment": 1,
        "name": "retrieval_methods",
        "description": "BM25 vs dense vs hybrid retrieval on identical chunks and questions.",
        "config": {
            "chunk_size_tokens": chunk_size,
            "embedding_model": model_name,
            "methods": methods,
            "k_values": [5, 10],
            "queries": len(queries),
        },
        "results": results,
        "subsets": subsets_out,
    }


def evaluate_subsets(queries: List[dict], retrieve_fn) -> Dict[str, dict]:
    """Aggregate metrics on the hard and multi-doc question subsets."""
    subsets = {
        "hard": [q for q in queries if q.get("difficulty") == "hard"],
        "multi_doc": [q for q in queries if len(q["relevant_doc_ids"]) > 1],
        "easy": [q for q in queries if q.get("difficulty") == "easy"],
    }
    out = {}
    for name, sub in subsets.items():
        if not sub:
            continue
        out[name] = evaluate_retrieval(sub, retrieve_fn)["aggregate"]
    return out
