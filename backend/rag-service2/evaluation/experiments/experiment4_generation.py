"""
evaluation/experiments/experiment4_generation.py

Experiment 4 — Generation-stage evaluation.

Evaluates the answer generation stage separately from retrieval. For each
question the harness retrieves context with the strongest retrieval
configuration (hybrid by default), generates an answer, and scores it with
generation metrics: faithfulness, hallucination rate, answer relevance and
context relevance.

Generators
----------
* ``extractive`` — offline baseline: the answer is the most relevant
  retrieved chunk. Always available, fully reproducible.
* ``gemini`` — the production Gemini generator (requires GEMINI_API_KEY);
  skipped automatically when no key is present.

Scoring
-------
* Heuristic scorer (lexical claim support; embedding similarity for
  relevance) — always available.
* LLM-as-judge (Gemini) — used automatically when GEMINI_API_KEY is set,
  with heuristic fallback per sample on judge failure.
"""
from __future__ import annotations

from typing import Callable, Dict, List, Optional

from evaluation.experiments.common import (
    DEFAULT_CHUNK_SIZE,
    DEFAULT_EMBEDDING_MODEL,
    build_chunks,
    build_retriever,
    make_retrieve_fn,
)
from evaluation.metrics.generation_metrics import (
    HeuristicGenerationScorer,
    LLMJudge,
    evaluate_generation,
)
from evaluation.retrieval.base import SearchResult


# ----------------------------------------------------------------------
# Generators
# ----------------------------------------------------------------------
class ExtractiveGenerator:
    """Baseline: answer = the single most relevant retrieved chunk."""

    name = "extractive"

    def __init__(self, retrieve_fn) -> None:
        self.retrieve_fn = retrieve_fn

    def generate(self, question: str, k: int = 5, contexts=None) -> str:
        results: List[SearchResult] = self.retrieve_fn(question, k)
        if not results:
            return "I couldn't find that information in the available documents."
        return results[0].chunk.text


class GeminiGenerator:
    """Production-style generator wrapper (services.generator.Generator)."""

    name = "gemini"

    def __init__(self, generator=None, prompt_builder: Optional[Callable] = None) -> None:
        self.generator = None
        if generator is None:
            try:
                from services.generator import Generator  # type: ignore

                generator = Generator()
            except Exception:
                generator = None
        self.generator = generator
        self.prompt_builder = prompt_builder or self._default_prompt

    @staticmethod
    def _default_prompt(question: str, contexts: List[str]) -> str:
        context_block = "\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts))
        return (
            "You are a medical research assistant. Answer the question using ONLY the "
            "retrieved context below. If the context does not contain the answer, say "
            "that you could not find the information.\n\n"
            f"CONTEXT:\n{context_block}\n\nQUESTION:\n{question}\n\nANSWER:"
        )

    @property
    def available(self) -> bool:
        return self.generator is not None and getattr(self.generator, "client", None) is not None

    def generate(self, question: str, k: int = 5, contexts: Optional[List[str]] = None) -> str:
        contexts = contexts or []
        prompt = self.prompt_builder(question, contexts)
        return self.generator.generate(prompt)


# ----------------------------------------------------------------------
# Experiment entry point
# ----------------------------------------------------------------------
def run(
    corpus: List[dict],
    questions: List[dict],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    model_name: str = DEFAULT_EMBEDDING_MODEL,
    retrieval_method: str = "hybrid",
    generator_names: List[str] = ("extractive",),
    use_llm_judge: bool = True,
    max_queries: int = 0,
    embedding_based: bool = True,
) -> Dict:
    """
    Run Experiment 4.

    Returns per-generator results, each with aggregate + per-sample scores
    and the judge used.
    """
    chunks = build_chunks(corpus, chunk_size=chunk_size)
    queries = questions[:max_queries] if max_queries else questions

    retriever = build_retriever(retrieval_method, chunks, model_name=model_name)
    retrieve_fn = make_retrieve_fn(retriever, k=10)

    # Embedding-based heuristic scoring when available.
    embed_fn = None
    if embedding_based:
        try:
            probe = build_retriever("dense", chunks, model_name=model_name)
            probe._ensure_indexed()  # fit builtin embedders on the corpus
            embed_fn = probe.embed_texts
        except Exception:
            embed_fn = None

    heuristic = HeuristicGenerationScorer(embed_fn=embed_fn)

    generators: List = []
    for name in generator_names:
        if name == "extractive":
            generators.append(ExtractiveGenerator(retrieve_fn))
        elif name == "gemini":
            gen = GeminiGenerator()
            if gen.available:
                generators.append(gen)
        else:
            raise ValueError(f"Unknown generator: {name}")

    judge = None
    if use_llm_judge:
        try:
            judge = LLMJudge(fallback=heuristic)
        except Exception:
            judge = None

    results: Dict[str, Dict] = {}
    for generator in generators:
        samples = []
        for q in queries:
            contexts = [r.chunk.text for r in retrieve_fn(q["question"], 5)]
            answer = generator.generate(q["question"], k=5, contexts=contexts)
            samples.append(
                {
                    "id": q["id"],
                    "question": q["question"],
                    "answer": answer,
                    "expected_answer": q["expected_answer"],
                    "contexts": contexts,
                }
            )
        if judge is not None:
            out = evaluate_generation(samples, judge, lambda s, k: s["contexts"])
        else:
            out = evaluate_generation(samples, heuristic, lambda s, k: s["contexts"])
        results[generator.name] = out

    return {
        "experiment": 4,
        "name": "generation_stage",
        "description": "Generation-stage metrics (faithfulness, hallucination rate, answer/context relevance).",
        "config": {
            "chunk_size_tokens": chunk_size,
            "embedding_model": model_name,
            "retrieval_method": retrieval_method,
            "generators": list(results.keys()),
            "llm_judge": judge is not None and judge.available,
            "queries": len(queries),
        },
        "results": results,
    }
