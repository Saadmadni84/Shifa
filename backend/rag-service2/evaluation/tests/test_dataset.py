"""Integrity tests for the benchmark corpus and QA dataset."""

from evaluation.dataset.load_dataset import (
    corpus_stats,
    dataset_stats,
    load_corpus,
    load_questions,
)


class TestDataset:
    def test_corpus_integrity(self):
        corpus = load_corpus()
        assert len(corpus) >= 40
        ids = [d["doc_id"] for d in corpus]
        assert len(ids) == len(set(ids)), "duplicate doc ids"
        for doc in corpus:
            assert doc["content"].strip(), doc["doc_id"]
            assert len(doc["content"].split()) > 100, doc["doc_id"]
            assert doc["source_note"].startswith("Original"), doc["doc_id"]

    def test_questions_integrity(self):
        questions = load_questions()
        assert 100 <= len(questions) <= 200
        ids = [q["id"] for q in questions]
        assert len(ids) == len(set(ids)), "duplicate question ids"
        doc_ids = {d["doc_id"] for d in load_corpus()}
        for q in questions:
            assert q["question"].strip() and q["question"].endswith("?"), q["id"]
            assert q["expected_answer"].strip(), q["id"]
            assert q["relevant_doc_ids"], q["id"]
            assert set(q["relevant_doc_ids"]) <= doc_ids, q["id"]

    def test_stats(self):
        corpus = load_corpus()
        questions = load_questions()
        cs, qs = corpus_stats(corpus), dataset_stats(questions)
        assert cs["documents"] == len(corpus)
        assert qs["questions"] == len(questions)
        assert qs["single_doc"] + qs["multi_doc"] == len(questions)
