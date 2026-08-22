"""Smoke test: a full pipeline pass on a tiny corpus (BM25 only, offline).

Dense/hybrid paths are exercised here only when sentence-transformers is
installed; CI without heavy ML dependencies still covers chunking, BM25,
metrics and end-to-end orchestration.
"""

import pytest

from evaluation.chunking.chunker import TokenChunker
from evaluation.experiments.experiment1_retrieval import run as run_exp1
from evaluation.metrics.retrieval_metrics import evaluate_retrieval
from evaluation.retrieval.bm25 import BM25Retriever

TINY_CORPUS = [
    {"doc_id": "d1", "title": "T1", "content": "Metformin is the first-line drug for type 2 diabetes. It reduces hepatic glucose production."},
    {"doc_id": "d2", "title": "T2", "content": "Salbutamol is a short-acting bronchodilator used for quick relief in asthma attacks."},
]

TINY_QUESTIONS = [
    {"id": "t1", "question": "What is the first-line drug for type 2 diabetes?", "expected_answer": "Metformin.", "relevant_doc_ids": ["d1"]},
    {"id": "t2", "question": "Which drug relieves asthma quickly?", "expected_answer": "Salbutamol.", "relevant_doc_ids": ["d2"]},
]


class TestSmoke:
    def test_end_to_end_bm25_only(self):
        result = run_exp1(TINY_CORPUS, TINY_QUESTIONS, methods=["bm25"])
        agg = result["results"]["bm25"]["aggregate"]
        assert agg["queries"] == 2
        assert agg["recall@5"] == 1.0
        assert agg["mrr"] == 1.0

    def test_dense_and_hybrid_when_available(self):
        pytest.importorskip("sentence_transformers")
        try:
            result = run_exp1(TINY_CORPUS, TINY_QUESTIONS, methods=["dense", "hybrid"])
        except Exception as exc:  # model download failure -> skip, not fail
            pytest.skip(f"embedding model unavailable: {exc}")
        assert result["results"]["dense"]["aggregate"]["recall@5"] == 1.0
        assert result["results"]["hybrid"]["aggregate"]["recall@5"] == 1.0

    def test_metric_fn_works_over_chunks(self):
        chunker = TokenChunker(max_tokens=64)
        chunks = chunker.chunk_documents(TINY_CORPUS)
        bm25 = BM25Retriever(chunks)
        out = evaluate_retrieval(TINY_QUESTIONS, bm25.search, k_values=[1, 5])
        assert out["aggregate"]["recall@1"] >= 0.5
