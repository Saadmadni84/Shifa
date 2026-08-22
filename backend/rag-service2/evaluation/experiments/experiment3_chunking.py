"""
evaluation/experiments/experiment3_chunking.py

Experiment 3 — Chunk-size study.

Chunks the same corpus at 256 / 512 / 768 / 1024 tokens (token-count based,
no overlap) and measures retrieval quality for each condition with BM25,
dense and hybrid retrieval. This answers the research question:

    How does chunk size affect retrieval quality in domain-specific
    medical QA?

Controls: embedding model (MiniLM).
"""
from __future__ import annotations

from typing import Dict, List

from evaluation.experiments.common import (
    DEFAULT_EMBEDDING_MODEL,
    build_chunks,
    build_retriever,
    make_retrieve_fn,
)
from evaluation.metrics.retrieval_metrics import evaluate_retrieval


def run(
    corpus: List[dict],
    questions: List[dict],
    chunk_sizes: List[int],
    methods: List[str],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    max_queries: int = 0,
) -> Dict:
    queries = questions[:max_queries] if max_queries else questions

    results: Dict[str, Dict] = {}
    for size in chunk_sizes:
        chunks = build_chunks(corpus, chunk_size=size)
        results[str(size)] = {}
        for method in methods:
            retriever = build_retriever(method, chunks, model_name=model_name)
            results[str(size)][method] = evaluate_retrieval(
                queries, make_retrieve_fn(retriever)
            )

    return {
        "experiment": 3,
        "name": "chunk_size",
        "description": "Effect of chunk size (tokens) on retrieval quality in domain-specific medical QA.",
        "config": {
            "chunk_sizes": chunk_sizes,
            "methods": methods,
            "embedding_model": model_name,
            "k_values": [5, 10],
            "queries": len(queries),
        },
        "results": results,
    }
