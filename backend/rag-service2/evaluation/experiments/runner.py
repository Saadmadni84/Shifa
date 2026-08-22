"""
evaluation/experiments/runner.py

Orchestrates the experiment suite end-to-end and persists results.
"""

from __future__ import annotations

import json
import os
import time
from typing import Dict, List, Optional

from evaluation.dataset.load_dataset import (
    corpus_stats,
    dataset_stats,
    load_corpus,
    load_questions,
)
from evaluation.experiments.common import (
    CHUNK_SIZE_SUITE,
    DEFAULT_CHUNK_SIZE,
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_MODEL_SUITE,
)
from evaluation.experiments.experiment1_retrieval import run as run_exp1
from evaluation.experiments.experiment2_embeddings import run as run_exp2
from evaluation.experiments.experiment3_chunking import run as run_exp3
from evaluation.experiments.experiment4_generation import run as run_exp4

EXPERIMENT_REGISTRY = {
    "1": run_exp1,
    "2": run_exp2,
    "3": run_exp3,
    "4": run_exp4,
}


def run_experiments(
    experiment_ids: List[str] = ("1", "2", "3", "4"),
    max_queries: int = 0,
    embedding_models: Optional[List[str]] = None,
    chunk_sizes: Optional[List[int]] = None,
    retrieval_methods: Optional[List[str]] = None,
    output_dir: str = "evaluation/results",
    include_generation_llm: bool = True,
    seed: int = 42,
) -> Dict:
    """
    Run the requested experiments and write results to ``output_dir``.

    Returns a summary dict with paths of the written artifacts.
    """
    import random

    random.seed(seed)

    corpus = load_corpus()
    questions = load_questions()
    if max_queries:
        # Deterministic subsample for quick smoke runs.
        rng = random.Random(seed)
        questions = rng.sample(questions, min(max_queries, len(questions)))

    cstats = corpus_stats(corpus)
    qstats = dataset_stats(questions)

    models = embedding_models or EMBEDDING_MODEL_SUITE
    sizes = chunk_sizes or CHUNK_SIZE_SUITE
    methods = retrieval_methods or ["bm25", "dense", "hybrid"]

    os.makedirs(output_dir, exist_ok=True)
    artifacts: Dict[str, str] = {}

    summary: Dict = {
        "suite": "shifa-med-benchmark-v1",
        "run_started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "corpus": cstats,
        "dataset": qstats,
        "config": {
            "embedding_models": models,
            "chunk_sizes": sizes,
            "retrieval_methods": methods,
            "max_queries": max_queries or "all",
        },
        "experiments": {},
    }

    for exp_id in experiment_ids:
        t0 = time.perf_counter()
        if exp_id == "1":
            out = run_exp1(corpus, questions, methods=methods, model_name=DEFAULT_EMBEDDING_MODEL, max_queries=0)
        elif exp_id == "2":
            out = run_exp2(corpus, questions, models=models, max_queries=0)
        elif exp_id == "3":
            out = run_exp3(corpus, questions, chunk_sizes=sizes, methods=methods, max_queries=0)
        elif exp_id == "4":
            out = run_exp4(
                corpus,
                questions,
                generator_names=["extractive"] + (["gemini"] if include_generation_llm else []),
                use_llm_judge=include_generation_llm,
                max_queries=0,
            )
        else:
            raise ValueError(f"Unknown experiment id: {exp_id}")

        elapsed = round(time.perf_counter() - t0, 2)
        out["elapsed_seconds"] = elapsed
        summary["experiments"][f"experiment_{exp_id}"] = {
            "name": out["name"],
            "elapsed_seconds": elapsed,
        }

        path = os.path.join(output_dir, f"experiment_{exp_id}_{out['name']}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2)
        artifacts[out["name"]] = path

    summary_path = os.path.join(output_dir, "results_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    artifacts["summary"] = summary_path

    return {"summary": summary, "artifacts": artifacts}
