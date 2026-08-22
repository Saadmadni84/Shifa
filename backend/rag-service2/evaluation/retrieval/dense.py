"""
evaluation/retrieval/dense.py

Dense (semantic) retriever backed by embedding models.

Two families of embeddings are supported:

* **Built-in offline embedders** — ``lsa-<dim>`` (TF-IDF + truncated SVD,
  e.g. ``lsa-200``) and ``ngram-hash-<dim>`` (feature-hashed character
  n-grams, e.g. ``ngram-hash-512``). Deterministic, numpy-only, no network.
* **Sentence-transformers models** — any model name (e.g.
  ``sentence-transformers/all-MiniLM-L6-v2``) is loaded on demand; the
  harness falls back to built-in embedders when the download is
  unavailable.

Every chunk is embedded once at index time and queries are scored with
cosine similarity. The index is held in memory (NumPy) so the harness is
fully self-contained and does not depend on ChromaDB state.
"""

from __future__ import annotations

import re
from typing import List, Optional

import numpy as np

from evaluation.retrieval.base import BaseRetriever, Chunk, SearchResult
from evaluation.retrieval.local_embeddings import LSAEmbedder, NGramHashEmbedder


def is_builtin_model(model_name: str) -> bool:
    return bool(re.match(r"^(lsa|ngram-hash)-\d+$", model_name))


def make_builtin_embedder(model_name: str):
    kind, _, dim = model_name.rpartition("-")
    dim = int(dim)
    if kind == "lsa":
        return LSAEmbedder(dim=dim)
    if kind == "ngram-hash":
        return NGramHashEmbedder(dim=dim)
    raise ValueError(f"Unknown builtin embedder: {model_name}")


class DenseRetriever(BaseRetriever):
    """Cosine-similarity retriever over dense embeddings."""

    name = "dense"

    _GLOBAL_EMBEDDING_CACHE: dict = {}

    def __init__(
        self,
        chunks: List[Chunk],
        model_name: str = "lsa-200",
        normalize: bool = True,
    ) -> None:
        super().__init__(chunks)
        self.model_name = model_name
        self._model = None
        self._local_embedder = None
        self._embeddings: Optional[np.ndarray] = None
        self.normalize = normalize

    # ------------------------------------------------------------------
    # Model / embedding handling
    # ------------------------------------------------------------------
    @property
    def model(self):
        """Sentence-transformers model (only used for remote model names)."""
        if is_builtin_model(self.model_name):
            raise RuntimeError(f"{self.model_name} is a builtin offline embedder")
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        return self._model

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if is_builtin_model(self.model_name):
            if self._local_embedder is None:
                self._local_embedder = make_builtin_embedder(self.model_name)
                # builtin embedders are fitted on the corpus they index
                self._local_embedder.fit([c.text for c in self.chunks])
            vectors = np.asarray(
                self._local_embedder.encode(texts), dtype=np.float64
            )
        else:
            vectors = self.model.encode(
                texts, convert_to_numpy=True, show_progress_bar=False
            )
            vectors = np.asarray(vectors, dtype=np.float64)
        if self.normalize:
            norms = np.linalg.norm(vectors, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            vectors = vectors / norms
        return vectors

    def _ensure_indexed(self) -> None:
        if self._embeddings is not None:
            return
        cache_key = (self.model_name, tuple(c.chunk_id for c in self.chunks))
        cached = self._GLOBAL_EMBEDDING_CACHE.get(cache_key)
        if cached is not None:
            self._embeddings = cached
            return
        self._embeddings = self.embed_texts([c.text for c in self.chunks])
        # keep the cache bounded-ish: drop old entries when it grows large
        if len(self._GLOBAL_EMBEDDING_CACHE) > 32:
            self._GLOBAL_EMBEDDING_CACHE.clear()
        self._GLOBAL_EMBEDDING_CACHE[cache_key] = self._embeddings

    def search(self, query: str, k: int = 10) -> List[SearchResult]:
        if not query or not query.strip() or not self.chunks:
            return []
        self._ensure_indexed()
        q_vec = self.embed_texts([query.strip()])[0]
        scores = self._embeddings @ q_vec  # both unit-normalised -> cosine
        order = np.argsort(-scores, kind="stable")
        results: List[SearchResult] = []
        for rank, idx in enumerate(order[:k]):
            results.append(
                SearchResult(chunk=self.chunks[idx], score=float(scores[idx]), rank=rank + 1)
            )
        return results

    @property
    def embedding_dim(self) -> int:
        self._ensure_indexed()
        return int(self._embeddings.shape[1])

    def index_size(self) -> int:
        self._ensure_indexed()
        return int(self._embeddings.shape[0])


def build_dense(chunks: List[Chunk], model_name: str, **kwargs) -> DenseRetriever:
    return DenseRetriever(chunks, model_name=model_name, **kwargs)
