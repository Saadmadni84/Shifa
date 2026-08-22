"""
evaluation/experiments/experiment2_embeddings.py

Experiment 2 — Embedding model comparison.

Runs the exact same question set through 2-3 sentence-transformers models
using dense (and optionally hybrid) retrieval, measuring Recall@5,
Recall@10, MRR and Precision@K. This isolates the effect of the embedding
model on retrieval quality.

Controls: chunk size (512 tokens), retrieval methods (dense and hybrid —
BM25 is embedding-free, so it serves as a fixed baseline).
"""
from __future__ import annotations

from typing import Dict, List

from evaluation.experiments.common import (
    DEFAULT_CHUNK_SIZE,
    EMBEDDING_MODEL_SUITE,
    build_chunks,
    build_retriever,
    make_retrieve_fn,
)
from evaluation.metrics.retrieval_metrics import evaluate_retrieval


def run(
    corpus: List[dict],
    questions: List[dict],
    models: List[str],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    methods: List[str] = ("dense", "hybrid"),
    max_queries: int = 0,
) -> Dict:
    chunks = build_chunks(corpus, chunk_size=chunk_size)
    queries = questions[:max_queries] if max_queries else questions

    results: Dict[str, Dict] = {}
    for model in models:
        results[model] = {}
        # share the dense index with the hybrid retriever (embeddings cached)
        dense = build_retriever("dense", chunks, model_name=model)
        by_name = {"dense": dense}
        if "hybrid" in methods:
            from evaluation.retrieval.bm25 import BM25Retriever
            from evaluation.retrieval.hybrid import HybridRetriever

            by_name["hybrid"] = HybridRetriever.from_retrievers(
                chunks, BM25Retriever(chunks), dense
            )
        for method in methods:
            retriever = by_name.get(method)
            if retriever is None:
                retriever = build_retriever(method, chunks, model_name=model)
            results[model][method] = evaluate_retrieval(
                queries, make_retrieve_fn(retriever)
            )

    return {
        "experiment": 2,
        "name": "embedding_models",
        "description": "Same queries, same chunks, different embedding models (dense + hybrid retrieval).",
        "config": {
            "chunk_size_tokens": chunk_size,
            "models": models,
            "methods": list(methods),
            "k_values": [5, 10],
            "queries": len(queries),
        },
        "results": results,
    }
