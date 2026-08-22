"""
evaluation/retrieval/local_embeddings.py

Offline, deterministic dense embedding models for the evaluation harness.

Two built-in embedders are provided so the full experiment suite runs
without network access to model hubs:

* ``lsa`` — classic latent semantic analysis (Deerwester et al., 1990):
  TF-IDF term matrix reduced with truncated SVD. A genuine dense
  (semantic-ish) retrieval representation, fully reproducible.
* ``ngram-hash`` — feature-hashed character n-gram embeddings with IDF
  weighting. A high-dimensional sparse-to-dense lexical baseline.

The harness additionally supports any sentence-transformers model by name
(e.g. ``sentence-transformers/all-MiniLM-L6-v2``, ``BAAI/bge-small-en-v1.5``,
``sentence-transformers/all-mpnet-base-v2``); those require a one-time
download from HuggingFace and are used automatically when available.
"""

from __future__ import annotations

import hashlib
import math
import re
from typing import Dict, List, Optional

import numpy as np

from evaluation.retrieval.base import tokenize


# ----------------------------------------------------------------------
# LSA (TF-IDF + truncated SVD)
# ----------------------------------------------------------------------
class LSAEmbedder:
    """Latent-semantic dense embeddings via TF-IDF and truncated SVD."""

    kind = "lsa"

    def __init__(self, dim: int = 200, min_df: int = 1) -> None:
        self.dim = int(dim)
        self.min_df = min_df
        self._vocab: List[str] = []
        self._idf: np.ndarray = np.zeros(0)
        self._u_k: Optional[np.ndarray] = None   # (n_chunks, dim) left singular vectors
        self._s_k: Optional[np.ndarray] = None   # (dim,)
        self._fitted = False

    # ------------------------------------------------------------------
    def _term_matrix(self, texts: List[str], rebuild: bool = True) -> np.ndarray:
        """Return TF-IDF matrix (n_texts, n_terms)."""
        tokenized = [tokenize(t) for t in texts]
        if rebuild:
            term_set: Dict[str, int] = {}
            for toks in tokenized:
                for tok in toks:
                    if tok not in term_set:
                        term_set[tok] = len(term_set)

            n = len(tokenized)
            df = np.zeros(len(term_set), dtype=np.float64)
            for toks in tokenized:
                for tok in set(toks):
                    df[term_set[tok]] += 1.0

            keep = df >= self.min_df
            self._vocab = [tok for tok, k in zip(term_set, keep) if k]
            idf = np.log((n + 1.0) / (df[keep] + 1.0)) + 1.0
            self._idf = idf
        elif not self._vocab:
            raise RuntimeError("LSA embedder must be fitted before encode()")

        col_index = {tok: i for i, tok in enumerate(self._vocab)}
        matrix = np.zeros((len(tokenized), len(self._vocab)), dtype=np.float64)
        for row, toks in enumerate(tokenized):
            for tok in toks:
                idx = col_index.get(tok)
                if idx is not None:
                    matrix[row, idx] += 1.0
        tf = np.log1p(matrix)
        return tf * self._idf[np.newaxis, :]

    # ------------------------------------------------------------------
    def fit(self, texts: List[str]) -> np.ndarray:
        if not texts:
            self._fitted = True
            return np.zeros((0, self.dim), dtype=np.float64)
        matrix = self._term_matrix(texts, rebuild=True)
        u, s, _ = np.linalg.svd(matrix, full_matrices=False)
        k = min(self.dim, u.shape[1])
        self._u_k = u[:, :k]
        self._s_k = s[:k]
        # V_k (n_terms, k) = A^T U_k S_k^{-1} — used to project new texts
        self._v_k = matrix.T @ (self._u_k / self._s_k)
        self.dim = k
        self._fitted = True
        return self._normalize(self._u_k * self._s_k[np.newaxis, :])

    def encode(self, texts: List[str]) -> np.ndarray:
        if not self._fitted:
            return self.fit(texts)
        if not texts:
            return np.zeros((0, self.dim), dtype=np.float64)
        matrix = self._term_matrix(texts, rebuild=False)
        return self._normalize(matrix @ self._v_k)

    @staticmethod
    def _normalize(vectors: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return vectors / norms

    @property
    def embedding_dim(self) -> int:
        return self.dim


# ----------------------------------------------------------------------
# Hash n-gram embeddings
# ----------------------------------------------------------------------
class NGramHashEmbedder:
    """Feature-hashed character n-gram embeddings with IDF weighting."""

    kind = "ngram-hash"

    def __init__(self, dim: int = 512, ngram_range: tuple = (2, 3), min_df: int = 1) -> None:
        self.dim = int(dim)
        self.ngram_range = tuple(ngram_range)
        self.min_df = min_df
        self._idf: Dict[str, float] = {}
        self._fitted = False

    # ------------------------------------------------------------------
    def _ngrams(self, text: str) -> List[str]:
        lowered = re.sub(r"[^a-z0-9]+", " ", text.lower())
        out: List[str] = []
        for n in self.ngram_range:
            for i in range(len(lowered) - n + 1):
                gram = lowered[i : i + n]
                if " " in gram:
                    continue
                out.append(gram)
        return out

    def fit(self, texts: List[str]) -> np.ndarray:
        n = len(texts)
        df: Dict[str, int] = {}
        for t in texts:
            for gram in set(self._ngrams(t)):
                df[gram] = df.get(gram, 0) + 1
        self._idf = {
            gram: math.log((n + 1.0) / (freq + 1.0)) + 1.0
            for gram, freq in df.items()
            if freq >= self.min_df
        }
        self._fitted = True
        return self.encode(texts)

    def encode(self, texts: List[str]) -> np.ndarray:
        vectors = np.zeros((len(texts), self.dim), dtype=np.float64)
        for row, t in enumerate(texts):
            for gram in set(self._ngrams(t)):
                weight = self._idf.get(gram, 0.0)
                if weight <= 0.0:
                    continue
                digest = hashlib.md5(gram.encode("utf-8")).digest()
                idx = int.from_bytes(digest[:4], "little") % self.dim
                # signed hashing reduces bias
                sign = 1.0 if digest[4] % 2 == 0 else -1.0
                vectors[row, idx] += sign * weight
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return vectors / norms

    @property
    def embedding_dim(self) -> int:
        return self.dim
