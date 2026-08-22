"""
evaluation
==========

Research evaluation framework for the Shifa RAG pipeline.

This package turns the Shifa RAG service into a controlled retrieval /
generation research harness. It ships with:

* A self-contained medical QA benchmark (corpus + questions) under ``corpus/``
  and ``dataset/``.
* Three retrievers (BM25, dense embeddings, hybrid RRF fusion) with a common
  interface, plus token-based chunking.
* Standard retrieval metrics (Recall@K, Precision@K, MRR, nDCG@K) and
  generation metrics (faithfulness, answer/context relevance, hallucination
  rate) with both a heuristic (offline) and an LLM-as-judge implementation.
* Four experiments that can be run end-to-end offline:

  1. Retrieval method comparison (BM25 vs dense vs hybrid)
  2. Embedding model comparison (2-3 sentence-transformers models)
  3. Chunk-size study (256 / 512 / 768 / 1024 tokens)
  4. Generation-stage evaluation (extractive baseline and/or Gemini)

See ``evaluation/README.md`` for methodology and how to run the harness.
"""

__version__ = "1.0.0"
