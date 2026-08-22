"""
evaluation/dataset/load_dataset.py

Loaders for the Shifa medical QA benchmark (corpus + questions).
"""

from __future__ import annotations

import json
import os
from typing import Dict, List

_CORPUS_PATH = os.path.join(os.path.dirname(__file__), "..", "corpus", "medical_corpus.json")
_DATASET_PATH = os.path.join(os.path.dirname(__file__), "qa_dataset.json")


def load_corpus(path: str = _CORPUS_PATH) -> List[dict]:
    """Load the medical corpus (list of {doc_id, title, topic, content})."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_questions(path: str = _DATASET_PATH) -> List[dict]:
    """Load the QA benchmark questions."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["questions"]


def corpus_stats(corpus: List[dict]) -> Dict[str, int]:
    words = sum(len(d["content"].split()) for d in corpus)
    return {
        "documents": len(corpus),
        "words": words,
        "topics": len({d.get("topic", "other") for d in corpus}),
    }


def dataset_stats(questions: List[dict]) -> Dict[str, int]:
    multi = sum(1 for q in questions if len(q["relevant_doc_ids"]) > 1)
    return {
        "questions": len(questions),
        "multi_doc": multi,
        "single_doc": len(questions) - multi,
    }
