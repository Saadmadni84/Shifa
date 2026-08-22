"""Unit tests for the evaluation harness metrics and retrieval components."""

from evaluation.retrieval.base import Chunk, SearchResult, make_chunk_id
from evaluation.retrieval.bm25 import BM25Retriever
from evaluation.metrics.retrieval_metrics import (
    hit_documents,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
    evaluate_retrieval,
)
from evaluation.metrics.generation_metrics import (
    HeuristicGenerationScorer,
    extract_claims,
)


def _chunk(doc_id: str, text: str, index: int = 0) -> Chunk:
    return Chunk(chunk_id=make_chunk_id(doc_id, index), doc_id=doc_id, text=text)


def _results(*pairs) -> list:
    """Build ranked results from (doc_id, text) pairs."""
    out = []
    for rank, (doc_id, text) in enumerate(pairs, start=1):
        c = _chunk(doc_id, text)
        out.append(SearchResult(chunk=c, score=float(1.0 / rank), rank=rank))
    return out


# ----------------------------------------------------------------------
# Retrieval metrics
# ----------------------------------------------------------------------
class TestRetrievalMetrics:
    def test_recall_at_k(self):
        results = _results(("a", "x"), ("b", "y"), ("c", "z"), ("d", "w"))
        assert recall_at_k(results, ["a"], 1) == 1.0
        assert recall_at_k(results, ["a", "b"], 1) == 0.5
        assert recall_at_k(results, ["a", "b"], 2) == 1.0
        assert recall_at_k(results, ["a", "b"], 0) == 0.0
        assert recall_at_k(results, ["zzz"], 10) == 0.0

    def test_precision_at_k(self):
        results = _results(("a", "x"), ("b", "y"), ("c", "z"))
        assert precision_at_k(results, ["a"], 1) == 1.0
        assert precision_at_k(results, ["a", "c"], 2) == 0.5
        assert precision_at_k(results, ["a"], 3) == 1.0 / 3.0

    def test_mrr(self):
        results = _results(("a", "x"), ("b", "y"), ("c", "z"))
        assert reciprocal_rank(results, ["c"], 10) == 1.0 / 3.0
        assert reciprocal_rank(results, ["zzz"], 10) == 0.0
        # first relevant at rank 2 among several
        assert reciprocal_rank(results, ["b", "c"], 10) == 0.5

    def test_mrr_deduplicates_doc(self):
        # two chunks of the same doc at rank 1 and 2: MRR counts the first only
        r1 = SearchResult(chunk=_chunk("a", "x"), score=1.0, rank=1)
        r2 = SearchResult(chunk=_chunk("a", "y"), score=0.5, rank=2)
        assert reciprocal_rank([r1, r2], ["a"], 10) == 1.0

    def test_ndcg(self):
        results = _results(("a", "x"), ("b", "y"), ("c", "z"), ("d", "w"))
        # perfect ranking for 2 relevant docs
        assert ndcg_at_k(results, ["a", "b"], 10) == 1.0
        # relevant docs at ranks 2 and 4 -> less than 1
        value = ndcg_at_k(results, ["b", "d"], 10)
        assert 0.0 < value < 1.0

    def test_hit_documents_dedupes(self):
        results = [
            SearchResult(chunk=_chunk("a", "x"), score=1.0, rank=1),
            SearchResult(chunk=_chunk("a", "y"), score=0.9, rank=2),
            SearchResult(chunk=_chunk("b", "z"), score=0.8, rank=3),
        ]
        assert hit_documents(results, 3) == ["a", "b"]

    def test_evaluate_retrieval_aggregates(self):
        queries = [
            {"id": "t1", "question": "q1", "relevant_doc_ids": ["a"]},
            {"id": "t2", "question": "q2", "relevant_doc_ids": ["zzz"]},
        ]

        def retrieve_fn(query, k):
            return _results(("a", "x"), ("b", "y"))

        out = evaluate_retrieval(queries, retrieve_fn, k_values=[1, 5])
        agg = out["aggregate"]
        assert agg["queries"] == 2
        assert agg["recall@1"] == 0.5  # one query hits, one misses
        assert agg["mrr"] == 0.5
        assert len(out["per_query"]) == 2


# ----------------------------------------------------------------------
# BM25
# ----------------------------------------------------------------------
class TestBM25:
    def _corpus(self):
        return [
            _chunk("d1", "Hypertension treatment uses ACE inhibitors and diuretics.", 0),
            _chunk("d2", "Diabetes management starts with metformin therapy.", 0),
            _chunk("d3", "Asthma reliever salbutamol opens the airways quickly.", 0),
        ]

    def test_ranks_matching_doc_first(self):
        bm25 = BM25Retriever(self._corpus())
        results = bm25.search("metformin for diabetes", k=3)
        assert results[0].doc_id == "d2"
        assert results[0].rank == 1
        assert results[0].score > 0

    def test_no_hits_returns_empty_or_low_scores(self):
        bm25 = BM25Retriever(self._corpus())
        results = bm25.search("zyzzyva quantum flux", k=3)
        assert len(results) == 0 or results[0].score <= 0

    def test_deterministic(self):
        a = BM25Retriever(self._corpus()).search("diabetes metformin", k=2)
        b = BM25Retriever(self._corpus()).search("diabetes metformin", k=2)
        assert [r.chunk_id for r in a] == [r.chunk_id for r in b]

    def test_empty_query(self):
        bm25 = BM25Retriever(self._corpus())
        assert bm25.search("", k=3) == []

    def test_longer_doc_with_same_terms_ranks_after_short_doc(self):
        # length normalisation: for equal term counts, the shorter doc scores higher
        chunks = [
            _chunk("short", "aspirin aspirin aspirin daily", 0),
            _chunk("long", "aspirin aspirin aspirin daily " + "filler words " * 40, 0),
        ]
        bm25 = BM25Retriever(chunks)
        results = bm25.search("aspirin", k=2)
        assert results[0].doc_id == "short"


# ----------------------------------------------------------------------
# Hybrid (RRF)
# ----------------------------------------------------------------------
class TestHybrid:
    def test_fusion_boosts_consensus(self):
        from evaluation.retrieval.hybrid import HybridRetriever

        chunks = [
            _chunk("a", "alpha beta gamma delta epsilon zeta eta theta iota kappa", 0),
            _chunk("b", "lambda mu nu xi omicron pi rho sigma tau upsilon", 0),
        ]

        class FakeSparse:
            def search(self, query, k=10):
                return _results(("a", "x"), ("b", "y"))

        class FakeDense:
            def search(self, query, k=10):
                return _results(("a", "x"), ("b", "y"))

        hybrid = HybridRetriever.from_retrievers(chunks, FakeSparse(), FakeDense())
        results = hybrid.search("any query", k=2)
        assert [r.doc_id for r in results] == ["a", "b"]
        assert results[0].score > results[1].score
        # RRF score for rank1+rank1 with k=60: 2 * 1/61
        assert abs(results[0].score - 2 * (1.0 / 61.0)) < 1e-9

    def test_disagreement_ranks_high_in_one(self):
        from evaluation.retrieval.hybrid import HybridRetriever

        chunks = [_chunk("a", "x", 0), _chunk("b", "y", 0), _chunk("c", "z", 0)]

        class FakeSparse:
            def search(self, query, k=10):
                return _results(("a", "x"), ("b", "y"), ("c", "z"))

        class FakeDense:
            def search(self, query, k=10):
                return _results(("b", "y"), ("c", "z"), ("a", "x"))

        hybrid = HybridRetriever.from_retrievers(chunks, FakeSparse(), FakeDense())
        results = hybrid.search("q", k=3)
        # b: ranks 2+1 -> 1/62 + 1/61, beats a (ranks 1+3) and c (3+2)
        assert results[0].doc_id == "b"
