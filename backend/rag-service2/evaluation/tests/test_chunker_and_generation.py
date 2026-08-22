"""Unit tests for the token chunker and generation metrics."""

import pytest

from evaluation.chunking.chunker import TokenChunker
from evaluation.metrics.generation_metrics import (
    HeuristicGenerationScorer,
    extract_claims,
)

SAMPLE_DOC = {
    "doc_id": "doc_test",
    "title": "Test Document",
    "content": (
        "Hypertension is defined as sustained blood pressure of 140/90 mmHg or higher. "
        "First-line agents include ACE inhibitors, ARBs, calcium channel blockers, and "
        "thiazide diuretics. Beta blockers are not first-line for uncomplicated "
        "hypertension. Most patients need two or more agents to reach target blood "
        "pressure. Routine monitoring includes blood pressure at every visit and yearly "
        "renal function tests. Lifestyle modification includes dietary sodium below two "
        "grams per day and regular aerobic exercise. Patients with diabetes usually "
        "start with an ACE inhibitor because of renoprotective effects. The DASH diet "
        "is recommended for most patients. Secondary causes include renal artery "
        "stenosis and primary aldosteronism. Hypertension is usually asymptomatic."
    ),
}


class TestTokenChunker:
    def test_chunks_respect_token_budget(self):
        chunker = TokenChunker(max_tokens=32, overlap_tokens=0)
        chunks = chunker.chunk_documents([SAMPLE_DOC])
        assert len(chunks) >= 2
        for c in chunks:
            assert c.metadata["tokens"] <= 32

    def test_all_content_preserved(self):
        chunker = TokenChunker(max_tokens=64, overlap_tokens=0)
        chunks = chunker.chunk_documents([SAMPLE_DOC])
        joined = " ".join(c.text for c in chunks)
        for phrase in ["renoprotective effects", "DASH diet", "primary aldosteronism"]:
            assert phrase in joined

    def test_chunk_ids_are_stable(self):
        a = TokenChunker(max_tokens=64).chunk_documents([SAMPLE_DOC])
        b = TokenChunker(max_tokens=64).chunk_documents([SAMPLE_DOC])
        assert [c.chunk_id for c in a] == [c.chunk_id for c in b]
        assert a[0].doc_id == "doc_test"
        assert a[0].chunk_id.startswith("doc_test::chunk:")

    def test_larger_budget_means_fewer_chunks(self):
        small = TokenChunker(max_tokens=16).chunk_documents([SAMPLE_DOC])
        large = TokenChunker(max_tokens=256).chunk_documents([SAMPLE_DOC])
        assert len(small) > len(large)

    def test_empty_document(self):
        chunks = TokenChunker(max_tokens=64).chunk_documents(
            [{"doc_id": "e", "content": ""}]
        )
        assert chunks == []


class TestGenerationMetrics:
    def test_extract_claims(self):
        claims = extract_claims(
            "Metformin is first-line. It lowers glucose. Does it cause weight gain? Yes."
        )
        assert len(claims) == 4
        assert claims[0] == "Metformin is first-line."

    def test_faithfulness_supported_answer(self):
        scorer = HeuristicGenerationScorer()
        answer = "Metformin is the first-line oral medication for type 2 diabetes."
        contexts = [
            "Metformin is a biguanide and the first-line oral medication for type 2 "
            "diabetes mellitus. It lowers blood glucose by reducing hepatic glucose "
            "production."
        ]
        score = scorer.score("What is metformin?", answer, contexts)
        assert score["faithfulness"] == 1.0
        assert score["hallucination_rate"] == 0.0

    def test_hallucination_detected(self):
        scorer = HeuristicGenerationScorer(support_threshold=0.5)
        answer = "Quarks cause diabetes. Metformin is first-line for diabetes."
        contexts = ["Metformin is the first-line oral medication for type 2 diabetes."]
        score = scorer.score("What causes diabetes?", answer, contexts)
        assert score["faithfulness"] < 1.0
        assert score["hallucination_rate"] > 0.0

    def test_answer_relevance_falls_back_to_lexical(self):
        scorer = HeuristicGenerationScorer()
        assert scorer.answer_relevance("What is metformin?", "Metformin") > 0.0
        assert scorer.answer_relevance("What is metformin?", "Banana") == 0.0

    def test_context_relevance_empty(self):
        scorer = HeuristicGenerationScorer()
        assert scorer.context_relevance("question", []) == 0.0

    def test_empty_answer(self):
        scorer = HeuristicGenerationScorer()
        assert scorer.faithfulness("", ["context"]) == 0.0
