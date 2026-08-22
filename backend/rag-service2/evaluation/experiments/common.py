"""
evaluation/experiments/common.py

Shared helpers for the experiment suite: chunk construction, retriever
factories, and embedding caching so repeated runs stay fast.
"""

from __future__ import annotations

from typing import Dict, List

from evaluation.chunking.chunker import TokenChunker
from evaluation.retrieval.base import Chunk, SearchResult
from evaluation.retrieval.bm25 import BM25Retriever
from evaluation.retrieval.dense import DenseRetriever
from evaluation.retrieval.hybrid import HybridRetriever

# Default embedding model for experiments that are not specifically about
# embeddings. ``lsa-200`` is a built-in offline embedder (TF-IDF + SVD);
# any sentence-transformers model name (e.g.
# "sentence-transformers/all-MiniLM-L6-v2") can be substituted — the same
# model family the production Shifa service uses.
DEFAULT_EMBEDDING_MODEL = "lsa-200"

# Models compared in Experiment 2. The default suite runs fully offline
# (built-in embedders). With network access to HuggingFace, pass any
# sentence-transformers models via --embedding-models, e.g.:
#   sentence-transformers/all-MiniLM-L6-v2 (384-dim),
#   BAAI/bge-small-en-v1.5 (384-dim),
#   sentence-transformers/all-mpnet-base-v2 (768-dim)
EMBEDDING_MODEL_SUITE = [
    "lsa-25",         # latent semantic analysis, 25 dims (offline)
    "lsa-50",         # latent semantic analysis, 50 dims (offline)
    "ngram-hash-512", # hashed char n-gram embeddings, 512 dims (offline)
]

# Chunk-size conditions for Experiment 3 (tokens, no overlap).
CHUNK_SIZE_SUITE = [256, 512, 768, 1024]

DEFAULT_CHUNK_SIZE = 512


def build_chunks(corpus: List[dict], chunk_size: int = DEFAULT_CHUNK_SIZE) -> List[Chunk]:
    """Token-chunk the corpus with the harness chunker."""
    chunker = TokenChunker(max_tokens=chunk_size, overlap_tokens=0)
    return chunker.chunk_documents(corpus)


def build_retriever(
    method: str,
    chunks: List[Chunk],
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> object:
    """Build a retriever by method name: bm25 | dense | hybrid."""
    method = method.lower()
    if method == "bm25":
        return BM25Retriever(chunks)
    if method == "dense":
        return DenseRetriever(chunks, model_name=model_name)
    if method == "hybrid":
        sparse = BM25Retriever(chunks)
        dense = DenseRetriever(chunks, model_name=model_name)
        return HybridRetriever.from_retrievers(chunks, sparse, dense)
    raise ValueError(f"Unknown retrieval method: {method}")


def make_retrieve_fn(retriever, k: int = 10):
    """Return a callable ``fn(query, top_k) -> List[SearchResult]``."""

    def retrieve(query: str, top_k: int = k) -> List[SearchResult]:
        return retriever.search(query, k=top_k)

    return retrieve


_embed_cache: Dict[str, object] = {}


def describe_model(model_name: str) -> str:
    """Short human-readable label for a model name."""
    return model_name.split("/")[-1]
