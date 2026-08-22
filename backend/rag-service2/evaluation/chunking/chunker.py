"""
evaluation/chunking/chunker.py

Token-aware recursive chunker used by the chunk-size experiment.

Unlike the character-count chunker used in the production pipeline
(``services/chunker.py``), this chunker splits on token counts measured with
a real tokenizer (tiktoken, cl100k_base). This makes the chunk-size
experiment (256 / 512 / 768 / 1024 tokens) well-defined: all documents are
split with exactly the same recursive strategy and only the token budget
changes.

Strategy: split recursively on paragraph breaks, newlines, sentence ends
(". "), then spaces, packing text into chunks of at most ``max_tokens``
tokens while preserving as much natural boundary structure as possible.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List, Optional

from evaluation.retrieval.base import Chunk, make_chunk_id

_SEPARATORS = ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "]


@dataclass
class ChunkingConfig:
    """Configuration for one chunking condition."""

    max_tokens: int
    overlap_tokens: int = 0
    tokenizer_name: str = "cl100k_base"


def _default_tokenizer(name: str):
    """Load a tiktoken encoding, falling back to a word-count estimator.

    tiktoken downloads its BPE rank files on first use; when that download
    is unavailable (offline/CI), we fall back to a deterministic
    word-count estimator so the harness still runs. Chunk metadata records
    which mode was used.
    """
    try:
        import tiktoken
        enc = tiktoken.get_encoding(name)
        return enc, "tiktoken"
    except Exception:
        return None, "word-count"


class _WordCountTokenizer:
    """Deterministic offline tokenizer fallback (one token per word)."""

    def encode(self, text: str) -> list:
        return text.split() if text else []

    def decode(self, tokens: list) -> str:
        return " ".join(tokens)


class TokenChunker:
    """Recursive token-count chunker."""

    def __init__(
        self,
        max_tokens: int = 512,
        overlap_tokens: int = 0,
        tokenizer: Optional[Callable[[str], list]] = None,
        tokenizer_name: str = "cl100k_base",
        separators: Optional[List[str]] = None,
    ) -> None:
        self.max_tokens = int(max_tokens)
        self.overlap_tokens = int(overlap_tokens)
        self.tokenizer_mode = "custom"
        if tokenizer is None:
            tokenizer, self.tokenizer_mode = _default_tokenizer(tokenizer_name)
        if tokenizer is None:
            tokenizer = _WordCountTokenizer()
            self.tokenizer_mode = "word-count"
        self._encode = tokenizer.encode if hasattr(tokenizer, "encode") else tokenizer
        self._decode: Optional[Callable[[list], str]] = None
        if hasattr(tokenizer, "decode"):
            self._decode = tokenizer.decode
        self.separators = separators or _SEPARATORS

    # ------------------------------------------------------------------
    def _count_tokens(self, text: str) -> int:
        return len(self._encode(text))

    def _split_on_separator(self, text: str, sep: str) -> List[str]:
        parts = text.split(sep)
        pieces: List[str] = []
        for part in parts:
            if part:
                pieces.append(part + sep if sep != " " else part + " ")
        return pieces

    def _recursive_split(self, text: str, depth: int = 0) -> List[str]:
        """Split ``text`` so that every piece fits within max_tokens."""
        if self._count_tokens(text) <= self.max_tokens:
            return [text] if text.strip() else []

        if depth >= len(self.separators):
            # Last resort: hard split at token boundaries.
            tokens = self._encode(text)
            out: List[str] = []
            for i in range(0, len(tokens), self.max_tokens):
                piece = self._decode(tokens[i : i + self.max_tokens]) if self._decode else ""
                if piece and piece.strip():
                    out.append(piece)
            return out

        sep = self.separators[depth]
        if sep not in text:
            return self._recursive_split(text, depth + 1)

        pieces = self._split_on_separator(text, sep)
        result: List[str] = []
        buffer = ""
        for piece in pieces:
            if self._count_tokens(piece) > self.max_tokens:
                # flush buffer, then recurse into the oversized piece
                if buffer.strip():
                    result.append(buffer)
                    buffer = ""
                result.extend(self._recursive_split(piece, depth + 1))
            elif self._count_tokens(buffer + piece) <= self.max_tokens:
                buffer += piece
            else:
                if buffer.strip():
                    result.append(buffer)
                buffer = piece
        if buffer.strip():
            result.append(buffer)
        return [p for p in result if p.strip()]

    # ------------------------------------------------------------------
    def split_text(self, text: str) -> List[str]:
        pieces = self._recursive_split(text)
        if self.overlap_tokens <= 0:
            return pieces

        overlapped: List[str] = []
        for i, piece in enumerate(pieces):
            if i == 0 or self._decode is None:
                overlapped.append(piece)
                continue
            prev_tokens = self._encode(pieces[i - 1])
            tail = prev_tokens[-self.overlap_tokens :]
            overlapped.append(self._decode(tail) + " " + piece)
        return overlapped

    # ------------------------------------------------------------------
    def chunk_documents(self, documents: List[dict]) -> List[Chunk]:
        """
        Chunk a list of documents.

        Parameters
        ----------
        documents : list of dicts
            Each dict must have ``doc_id`` and ``content``; optional ``title``
            is prepended to the content before splitting (kept in metadata).
        """
        chunks: List[Chunk] = []
        for doc in documents:
            doc_id = doc["doc_id"]
            title = doc.get("title", "")
            content = doc.get("content", "")
            text = f"{title}\n\n{content}" if title and not content.startswith(title) else content
            pieces = self.split_text(text)
            for i, piece in enumerate(pieces):
                chunks.append(
                    Chunk(
                        chunk_id=make_chunk_id(doc_id, i),
                        doc_id=doc_id,
                        text=piece,
                        metadata={
                            "title": title,
                            "chunk_index": i,
                            "max_tokens": self.max_tokens,
                            "tokens": self._count_tokens(piece),
                            "tokenizer": self.tokenizer_mode,
                        },
                    )
                )
        return chunks


def chunk_size_labels(chunk_sizes: List[int]) -> List[str]:
    return [f"{n} tokens" for n in chunk_sizes]
