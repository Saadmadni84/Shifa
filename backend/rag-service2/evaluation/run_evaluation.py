"""
evaluation/run_evaluation.py

Command-line entry point for the Shifa RAG evaluation suite.

Usage examples
--------------
    # full suite (retrieval + embeddings + chunking + generation)
    python -m evaluation.run_evaluation

    # quick smoke run: only Experiment 1 on 20 queries
    python -m evaluation.run_evaluation --experiments 1 --max-queries 20

    # custom embedding models / chunk sizes
    python -m evaluation.run_evaluation \
        --embedding-models sentence-transformers/all-MiniLM-L6-v2,BAAI/bge-small-en-v1.5 \
        --chunk-sizes 256,512,1024

    # skip the (optional) LLM judge / Gemini generation
    python -m evaluation.run_evaluation --skip-llm
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import List, Optional


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="python -m evaluation.run_evaluation",
        description="Run the Shifa RAG research evaluation suite.",
    )
    parser.add_argument(
        "--experiments",
        default="1,2,3,4",
        help="Comma-separated experiment ids: 1=retrieval methods, 2=embedding models, "
        "3=chunk size, 4=generation stage (default: all).",
    )
    parser.add_argument(
        "--max-queries",
        type=int,
        default=0,
        help="Cap the number of benchmark queries used (0 = all).",
    )
    parser.add_argument(
        "--embedding-models",
        default="",
        help="Comma-separated sentence-transformers model names for Experiment 2 "
        "(default: MiniLM-L6-v2, bge-small-en-v1.5, all-mpnet-base-v2).",
    )
    parser.add_argument(
        "--chunk-sizes",
        default="",
        help="Comma-separated chunk sizes in tokens for Experiment 3 "
        "(default: 256,512,768,1024).",
    )
    parser.add_argument(
        "--retrieval-methods",
        default="",
        help="Comma-separated methods: bm25,dense,hybrid (default: all three).",
    )
    parser.add_argument(
        "--output-dir",
        default="evaluation/results",
        help="Directory for result JSON files and the report (default: evaluation/results).",
    )
    parser.add_argument(
        "--skip-llm",
        action="store_true",
        help="Skip the Gemini generator and LLM-as-judge (offline heuristic only).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic query subsampling (default: 42).",
    )
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    from evaluation.experiments.runner import run_experiments

    experiment_ids = [e.strip() for e in args.experiments.split(",") if e.strip()]
    embedding_models = (
        [m.strip() for m in args.embedding_models.split(",") if m.strip()] or None
    )
    chunk_sizes = (
        [int(c) for c in args.chunk_sizes.split(",") if c.strip()] or None
    )
    retrieval_methods = (
        [m.strip() for m in args.retrieval_methods.split(",") if m.strip()] or None
    )

    print(f"[EVAL] Running experiments {experiment_ids} (queries: "
          f"{args.max_queries or 'all'}) → {args.output_dir}")

    outcome = run_experiments(
        experiment_ids=experiment_ids,
        max_queries=args.max_queries,
        embedding_models=embedding_models,
        chunk_sizes=chunk_sizes,
        retrieval_methods=retrieval_methods,
        output_dir=args.output_dir,
        include_generation_llm=not args.skip_llm,
        seed=args.seed,
    )

    from evaluation.report import write_report

    report_path = write_report(
        args.output_dir, outcome["artifacts"], outcome["summary"],
        report_path=f"{args.output_dir}/report.md",
    )

    summary = outcome["summary"]
    print(f"[EVAL] Done in {len(summary['experiments'])} experiments.")
    for name, path in outcome["artifacts"].items():
        print(f"  - {name}: {path}")
    print(f"  - report: {report_path}")

    # quick console digest
    print("\n[EVAL] Digest:")
    for exp_id in experiment_ids:
        path = outcome["artifacts"].get(
            {
                "1": "retrieval_methods",
                "2": "embedding_models",
                "3": "chunk_size",
                "4": "generation_stage",
            }.get(exp_id, ""),
            "",
        )
        if path:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            print(f"  Experiment {exp_id} ({data['name']}):")
            _print_digest(data)

    return 0


def _print_digest(data: dict) -> None:
    results = data.get("results", {})
    if data["name"] == "retrieval_methods":
        for method, res in results.items():
            a = res["aggregate"]
            print(f"    {method:7s} R@5={a['recall@5']:.3f} R@10={a['recall@10']:.3f} "
                  f"MRR={a['mrr']:.3f} P@5={a['precision@5']:.3f}")
    elif data["name"] == "embedding_models":
        for model, res in results.items():
            for method, r in res.items():
                a = r["aggregate"]
                print(f"    {model.split('/')[-1]:28s} {method:6s} R@5={a['recall@5']:.3f} "
                      f"R@10={a['recall@10']:.3f} MRR={a['mrr']:.3f}")
    elif data["name"] == "chunk_size":
        for size, res in results.items():
            for method, r in res.items():
                a = r["aggregate"]
                print(f"    {size:>5s} tok  {method:6s} R@5={a['recall@5']:.3f} "
                      f"R@10={a['recall@10']:.3f} MRR={a['mrr']:.3f}")
    elif data["name"] == "generation_stage":
        for gen, res in results.items():
            a = res["aggregate"]
            print(f"    {gen:10s} faithfulness={a['faithfulness']:.3f} "
                  f"hallucination={a['hallucination_rate']:.3f} "
                  f"answer_rel={a['answer_relevance']:.3f} ctx_rel={a['context_relevance']:.3f}")


if __name__ == "__main__":
    sys.exit(main())
