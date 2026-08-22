"""
evaluation/metrics/retrieval_metrics.py

Standard information-retrieval metrics used in Experiments 1-3.

Metrics are computed per query at the *document* level: a retrieved chunk
counts as a hit if its originating document is in the query's set of
relevant documents (the benchmark annotates relevance by document).

Definitions (for a single query, top-k ranked results):
    Recall@K    = |relevant ∩ retrieved_k| / |relevant|
    Precision@K = |relevant ∩ retrieved_k| / k
    MRR         = 1 / rank of the first relevant result (0 if none in top-k)
    nDCG@K      = DCG@K / IDCG@K with binary relevance
"""

from __future__ import annotations

import math
from typing import Dict, Iterable, List, Sequence, Set

from evaluation.retrieval.base import SearchResult, chunk_id_to_doc_id


def hit_documents(results: Sequence[SearchResult], k: int) -> List[str]:
    """Doc ids among the top-k results, in rank order, deduplicated."""
    seen: Set[str] = set()
    out: List[str] = []
    for r in results[:k]:
        doc_id = chunk_id_to_doc_id(r.chunk_id)
        if doc_id not in seen:
            seen.add(doc_id)
            out.append(doc_id)
    return out


def recall_at_k(results: Sequence[SearchResult], relevant: Iterable[str], k: int) -> float:
    relevant_set = set(relevant)
    if not relevant_set:
        return 0.0
    hits = set(hit_documents(results, k)) & relevant_set
    return len(hits) / len(relevant_set)


def precision_at_k(results: Sequence[SearchResult], relevant: Iterable[str], k: int) -> float:
    if k <= 0:
        return 0.0
    relevant_set = set(relevant)
    hits = set(hit_documents(results, k)) & relevant_set
    return len(hits) / k


def reciprocal_rank(results: Sequence[SearchResult], relevant: Iterable[str], k: int = 10) -> float:
    """1/rank of the first relevant doc among top-k (0.0 if none)."""
    relevant_set = set(relevant)
    for rank, doc_id in enumerate(hit_documents(results, k), start=1):
        if doc_id in relevant_set:
            return 1.0 / rank
    return 0.0


def ndcg_at_k(results: Sequence[SearchResult], relevant: Iterable[str], k: int = 10) -> float:
    """nDCG@K with binary relevance (1 if doc is relevant)."""
    relevant_set = set(relevant)
    hits = hit_documents(results, k)
    dcg = sum(
        1.0 / math.log2(rank + 1) if doc_id in relevant_set else 0.0
        for rank, doc_id in enumerate(hits, start=1)
    )
    ideal_hits = min(len(relevant_set), k)
    idcg = sum(1.0 / math.log2(rank + 1) for rank in range(1, ideal_hits + 1))
    return dcg / idcg if idcg > 0 else 0.0


def mean_over_queries(values: Sequence[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def evaluate_retrieval(
    queries: Sequence[dict],
    retrieve_fn,
    k_values: Sequence[int] = (5, 10),
) -> Dict[str, float]:
    """
    Run a retrieval function over a list of benchmark queries and aggregate
    Recall@K, Precision@K, MRR@K and nDCG@K across the query set.

    Parameters
    ----------
    queries : sequence of dicts
        Each dict needs ``question`` and ``relevant_doc_ids`` (list of str).
    retrieve_fn : callable
        ``retrieve_fn(query_text, k) -> List[SearchResult]``
    """
    k_values = sorted(k_values)
    max_k = max(k_values)

    per_query: List[Dict[str, float]] = []
    for q in queries:
        results = retrieve_fn(q["question"], max_k)
        row = {"query": q.get("id", ""), "question": q["question"]}
        for k in k_values:
            row[f"recall@{k}"] = recall_at_k(results, q["relevant_doc_ids"], k)
            row[f"precision@{k}"] = precision_at_k(results, q["relevant_doc_ids"], k)
            row[f"ndcg@{k}"] = ndcg_at_k(results, q["relevant_doc_ids"], k)
        row["mrr"] = reciprocal_rank(results, q["relevant_doc_ids"], max_k)
        per_query.append(row)

    agg: Dict[str, float] = {}
    for k in k_values:
        agg[f"recall@{k}"] = mean_over_queries([r[f"recall@{k}"] for r in per_query])
        agg[f"precision@{k}"] = mean_over_queries([r[f"precision@{k}"] for r in per_query])
        agg[f"ndcg@{k}"] = mean_over_queries([r[f"ndcg@{k}"] for r in per_query])
    agg["mrr"] = mean_over_queries([r["mrr"] for r in per_query])
    agg["queries"] = len(per_query)
    return {"aggregate": agg, "per_query": per_query}
