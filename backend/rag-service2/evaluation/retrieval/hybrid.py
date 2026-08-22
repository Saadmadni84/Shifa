"""
evaluation/retrieval/hybrid.py

Hybrid retriever: Reciprocal Rank Fusion (RRF) of sparse and dense rankings.

RRF (Cormack, Clarke & Buettcher, 2009) fuses two rankings without needing
comparable score scales:

    score(chunk) = sum over systems s of 1 / (k_rrf + rank_s(chunk))

where k_rrf is a small constant (60 by default). Only chunks that appear in
at least one ranked list are scored; chunks ranked in both lists get a
boost, which is exactly the behaviour we want to study in Experiment 1
(hybrid vs. each component alone).
"""

from __future__ import annotations

from typing import List, Optional

from evaluation.retrieval.base import BaseRetriever, Chunk, SearchResult
from evaluation.retrieval.dense import DenseRetriever
from evaluation.retrieval.bm25 import BM25Retriever


class HybridRetriever(BaseRetriever):
    """RRF fusion of a sparse (BM25) and a dense retriever."""

    name = "hybrid"

    def __init__(
        self,
        chunks: List[Chunk],
        sparse: Optional[BM25Retriever] = None,
        dense: Optional[DenseRetriever] = None,
        k_rrf: int = 60,
        dense_model_name: str = "lsa-200",
        per_system_k: int = 50,
    ) -> None:
        super().__init__(chunks)
        self.k_rrf = k_rrf
        self.per_system_k = per_system_k
        self.sparse = sparse or BM25Retriever(chunks)
        self.dense = dense or DenseRetriever(chunks, model_name=dense_model_name)

    @classmethod
    def from_retrievers(cls, chunks, sparse, dense, k_rrf: int = 60, per_system_k: int = 50):
        instance = cls.__new__(cls)
        BaseRetriever.__init__(instance, chunks)
        instance.k_rrf = k_rrf
        instance.per_system_k = per_system_k
        instance.sparse = sparse
        instance.dense = dense
        return instance

    def search(self, query: str, k: int = 10) -> List[SearchResult]:
        if not query or not query.strip() or not self.chunks:
            return []

        sparse_results = self.sparse.search(query, k=self.per_system_k)
        dense_results = self.dense.search(query, k=self.per_system_k)

        fused: dict = {}
        for results in (sparse_results, dense_results):
            for r in results:
                fused[r.chunk_id] = fused.get(r.chunk_id, 0.0) + 1.0 / (self.k_rrf + r.rank)

        ranked_ids = sorted(fused, key=fused.get, reverse=True)
        chunk_by_id = {c.chunk_id: c for c in self.chunks}

        results: List[SearchResult] = []
        for rank, chunk_id in enumerate(ranked_ids[:k], start=1):
            results.append(
                SearchResult(chunk=chunk_by_id[chunk_id], score=fused[chunk_id], rank=rank)
            )
        return results

    def component_sizes(self) -> dict:
        """Diagnostic: how many chunks each component ranked for a query."""
        return {"sparse": len(self.sparse.chunks), "dense": len(self.dense.chunks)}


def build_hybrid(chunks: List[Chunk], model_name: str, **kwargs) -> HybridRetriever:
    sparse = BM25Retriever(chunks)
    dense = DenseRetriever(chunks, model_name=model_name)
    return HybridRetriever.from_retrievers(chunks, sparse, dense, **kwargs)
