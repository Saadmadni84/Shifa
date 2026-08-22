"""
evaluation/retrieval/bm25.py

Pure-Python BM25+ (sparse / lexical) retriever.

BM25 is the classic lexical retrieval baseline: it scores chunks by the
overlap of query terms against the corpus statistics (term frequency,
document frequency, document length normalisation). We use the BM25+ variant
(Lv & Zhai, 2011) which adds a small delta to the term-frequency component to
avoid penalising long documents too aggressively.

Implementation notes
--------------------
* No external search library is required; the scoring loop is vectorised
  with NumPy over a pre-computed term-frequency matrix, which keeps the
  experiment harness dependency-light and deterministic.
* Documents are the *chunks*: the benchmark retrieves chunks and relevance
  is computed at the document level, mirroring how the production Shifa
  pipeline retrieves context chunks.
"""

from __future__ import annotations

import math
from collections import Counter
from typing import Dict, List, Optional

import numpy as np

from evaluation.retrieval.base import BaseRetriever, Chunk, SearchResult, tokenize


class BM25Retriever(BaseRetriever):
    """BM25+ sparse retriever over a fixed chunk collection."""

    name = "bm25"

    def __init__(
        self,
        chunks: List[Chunk],
        k1: float = 1.5,
        b: float = 0.75,
        delta: float = 0.5,
        epsilon: float = 0.25,
    ) -> None:
        super().__init__(chunks)
        self.k1 = k1
        self.b = b
        self.delta = delta
        self.epsilon = epsilon
        self._build_index()

    # ------------------------------------------------------------------
    # Index construction
    # ------------------------------------------------------------------
    def _build_index(self) -> None:
        self._tokenized: List[List[str]] = [tokenize(c.text) for c in self.chunks]
        self._doc_lengths: np.ndarray = np.array(
            [len(toks) for toks in self._tokenized], dtype=np.float64
        )
        self._avgdl = float(self._doc_lengths.mean()) if len(self._doc_lengths) else 0.0

        # term -> set of chunk indices containing it
        self._postings: Dict[str, List[int]] = {}
        for idx, toks in enumerate(self._tokenized):
            for term in set(toks):
                self._postings.setdefault(term, []).append(idx)

        self._df: Dict[str, int] = {term: len(idx) for term, idx in self._postings.items()}

        # idf with epsilon smoothing (same behaviour as rank_bm25)
        n_docs = len(self.chunks)
        self._idf: Dict[str, float] = {}
        for term, df in self._df.items():
            idf = math.log(1 + (n_docs - df + 0.5) / (df + 0.5))
            self._idf[term] = idf
        if n_docs > 0:
            avg_idf = sum(self._idf.values()) / max(len(self._idf), 1)
            for term in self._idf:
                if self._idf[term] < avg_idf * self.epsilon:
                    self._idf[term] = avg_idf * self.epsilon

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------
    def _score_query(self, query_tokens: List[str]) -> np.ndarray:
        """Return a BM25+ score for every chunk given the query tokens."""
        scores = np.zeros(len(self.chunks), dtype=np.float64)
        if not query_tokens or len(self.chunks) == 0:
            return scores

        # precompute the length normalisation denominator (shared by all terms)
        denom_norm = self.k1 * (1 - self.b + self.b * self._doc_lengths / max(self._avgdl, 1e-9))

        for term in set(query_tokens):
            df = self._df.get(term, 0)
            if df == 0:
                continue
            idf = self._idf[term]
            for doc_idx in self._postings[term]:
                tf = self._tokenized[doc_idx].count(term)
                tf_component = (tf * (self.k1 + 1)) / (tf + denom_norm[doc_idx])
                scores[doc_idx] += idf * (tf_component + self.delta)
        return scores

    def search(self, query: str, k: int = 10) -> List[SearchResult]:
        if not query or not query.strip():
            return []
        scores = self._score_query(tokenize(query))
        order = np.argsort(-scores, kind="stable")
        results: List[SearchResult] = []
        for rank, idx in enumerate(order):
            if scores[idx] <= 0.0 and len(results) >= 1:
                # stop once we run out of scored chunks
                if all(scores[order[j]] <= 0.0 for j in range(rank, len(order))):
                    break
            results.append(
                SearchResult(chunk=self.chunks[idx], score=float(scores[idx]), rank=rank + 1)
            )
            if len(results) >= k:
                break
        return results


def build_bm25(chunks: List[Chunk], **kwargs) -> BM25Retriever:
    """Factory helper so experiment code can construct retrievers uniformly."""
    return BM25Retriever(chunks, **kwargs)
