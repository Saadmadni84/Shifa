"""
evaluation/retrieval/base.py

Shared types and interfaces for retrievers used in the evaluation harness.

Every retriever works over a flat list of chunked documents and returns a
ranked list of ``SearchResult`` objects. Chunks are identified by a stable
``chunk_id`` (``"{doc_id}::chunk:{index}"``) so relevance annotations in the
benchmark dataset (which reference ``doc_id``) can be matched to chunks.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Chunk:
    """A single indexed text chunk."""

    chunk_id: str
    doc_id: str
    text: str
    metadata: Dict[str, object] = field(default_factory=dict)

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return f"Chunk({self.chunk_id!r}, {len(self.text)} chars)"


@dataclass
class SearchResult:
    """A single retrieved item with its score and rank position."""

    chunk: Chunk
    score: float
    rank: int = 0

    @property
    def chunk_id(self) -> str:
        return self.chunk.chunk_id

    @property
    def doc_id(self) -> str:
        return self.chunk.doc_id


class BaseRetriever:
    """Common interface implemented by every retrieval method."""

    name: str = "base"

    def __init__(self, chunks: List[Chunk]) -> None:
        self.chunks = chunks

    def search(self, query: str, k: int = 10) -> List[SearchResult]:
        """Return the top-k results for ``query``."""
        raise NotImplementedError

    def chunk_ids(self) -> List[str]:
        return [c.chunk_id for c in self.chunks]

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return f"<{self.__class__.__name__} name={self.name} chunks={len(self.chunks)}>"


def make_chunk_id(doc_id: str, index: int) -> str:
    return f"{doc_id}::chunk:{index}"


def chunk_id_to_doc_id(chunk_id: str) -> str:
    """Extract the originating document id from a chunk id."""
    return chunk_id.split("::chunk:", 1)[0]


def tokenize(text: str) -> List[str]:
    """
    Lightweight, deterministic tokenizer used by BM25 and lexical metrics.

    Lowercases, splits on non-alphanumeric characters and drops stopwords.
    """
    import re

    _STOPWORDS = frozenset(
        {
            "a", "an", "the", "and", "or", "but", "of", "to", "in", "on",
            "for", "with", "is", "are", "was", "were", "be", "been", "being",
            "at", "by", "as", "it", "its", "this", "that", "these", "those",
            "from", "can", "could", "may", "might", "shall", "should",
            "will", "would", "do", "does", "did", "have", "has", "had",
            "not", "no", "than", "then", "so", "if", "when", "while",
            "after", "before", "also", "very", "about", "into", "over",
            "more", "most", "such", "which", "who", "whom", "what", "how",
            "why", "there", "here", "their", "they", "we", "you", "your",
            "he", "she", "him", "her", "his", "our", "us", "them", "i",
        }
    )
    tokens = re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)?", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]
