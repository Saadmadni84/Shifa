"""
evaluation/metrics/generation_metrics.py

Generation-stage metrics: faithfulness, hallucination rate, answer relevance
and context relevance.

Two implementations are provided:

1. **Heuristic (offline)** — ``HeuristicGenerationScorer``. No LLM is needed.
   The answer is split into claims (sentences); each claim is checked for
   lexical support against the retrieved context (token containment with a
   configurable threshold). Relevance scores use embedding cosine similarity
   when a sentence-transformers model is available, otherwise token overlap.
   This gives a reproducible, zero-cost baseline that always runs.

2. **LLM-as-judge** — ``LLMJudge``. Uses Gemini (via the same google-genai
   client as the production generator) to score faithfulness, answer
   relevance and context relevance on a 0-5 scale, and to mark each answer
   claim as supported / unsupported so a hallucination rate can be computed.
   Used when ``GEMINI_API_KEY`` is set; otherwise the harness falls back to
   the heuristic scorer.

Metric definitions (aligned with RAGAS-style conventions):

    Faithfulness      = supported claims / total claims in the answer
    Hallucination rate = unsupported claims / total claims  (= 1 - faithfulness)
    Answer relevance   = how well the answer addresses the question
    Context relevance  = how relevant the retrieved context is to the question
"""

from __future__ import annotations

import json
import re
from typing import Callable, Dict, List, Optional, Sequence, Tuple

from evaluation.metrics.retrieval_metrics import mean_over_queries
from evaluation.retrieval.base import tokenize


# ======================================================================
# Claim handling
# ======================================================================
def extract_claims(answer: str) -> List[str]:
    """Split an answer into atomic claim sentences."""
    if not answer:
        return []
    # Normalise whitespace and split on sentence boundaries.
    text = re.sub(r"\s+", " ", answer).strip()
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9(])", text)
    claims = [p.strip() for p in parts if len(p.strip()) > 1]
    return claims


def _tokens(text: str) -> set:
    return set(tokenize(text))


def _lexical_support(claim: str, context_texts: Sequence[str], threshold: float) -> bool:
    """
    A claim is lexically supported if at least ``threshold`` of its content
    tokens appear in some context text.
    """
    claim_tokens = _tokens(claim)
    if not claim_tokens:
        return True
    for context in context_texts:
        ctx_tokens = _tokens(context)
        if not ctx_tokens:
            continue
        overlap = len(claim_tokens & ctx_tokens)
        if overlap / len(claim_tokens) >= threshold:
            return True
    return False


# ======================================================================
# Heuristic scorer (offline)
# ======================================================================
class HeuristicGenerationScorer:
    """Zero-cost lexical/embedding generation metrics (no LLM required)."""

    name = "heuristic"

    def __init__(
        self,
        support_threshold: float = 0.5,
        embed_fn: Optional[Callable[[List[str]], "object"]] = None,
    ) -> None:
        self.support_threshold = support_threshold
        self._embed_fn = embed_fn
        self._embedding_available = embed_fn is not None

    # ------------------------------------------------------------------
    def _embeddings(self, texts: List[str]):
        if self._embed_fn is None:
            raise RuntimeError("embed_fn not configured")
        return self._embed_fn(texts)

    def faithfulness(self, answer: str, contexts: Sequence[str]) -> float:
        claims = extract_claims(answer)
        if not claims:
            return 0.0
        supported = [
            c for c in claims if _lexical_support(c, contexts, self.support_threshold)
        ]
        return len(supported) / len(claims)

    def hallucination_rate(self, answer: str, contexts: Sequence[str]) -> float:
        return 1.0 - self.faithfulness(answer, contexts)

    # ------------------------------------------------------------------
    def answer_relevance(self, question: str, answer: str) -> float:
        if not question or not answer:
            return 0.0
        if self._embed_fn is not None:
            try:
                qv, av = self._embeddings([question, answer])
                import numpy as np

                qv = qv / (np.linalg.norm(qv) + 1e-9)
                av = av / (np.linalg.norm(av) + 1e-9)
                return float(np.dot(qv, av))
            except Exception:
                pass
        # fallback: token overlap (Jaccard)
        q_tokens, a_tokens = _tokens(question), _tokens(answer)
        union = q_tokens | a_tokens
        return len(q_tokens & a_tokens) / len(union) if union else 0.0

    def context_relevance(self, question: str, contexts: Sequence[str]) -> float:
        if not question or not contexts:
            return 0.0
        if self._embed_fn is not None:
            try:
                qv = self._embeddings([question])[0]
                import numpy as np

                qv = qv / (np.linalg.norm(qv) + 1e-9)
                cvs = self._embeddings(list(contexts))
                cvs = cvs / (np.linalg.norm(cvs, axis=1, keepdims=True) + 1e-9)
                sims = cvs @ qv
                return float(sims.max())  # best context, not average
            except Exception:
                pass
        q_tokens = _tokens(question)
        best = 0.0
        for ctx in contexts:
            c_tokens = _tokens(ctx)
            union = q_tokens | c_tokens
            if union:
                best = max(best, len(q_tokens & c_tokens) / len(union))
        return best

    # ------------------------------------------------------------------
    def score(
        self,
        question: str,
        answer: str,
        contexts: Sequence[str],
        expected_answer: Optional[str] = None,
    ) -> Dict[str, float]:
        return {
            "faithfulness": round(self.faithfulness(answer, contexts), 4),
            "hallucination_rate": round(self.hallucination_rate(answer, contexts), 4),
            "answer_relevance": round(self.answer_relevance(question, answer), 4),
            "context_relevance": round(self.context_relevance(question, contexts), 4),
        }


# ======================================================================
# LLM-as-judge (Gemini)
# ======================================================================
_JUDGE_PROMPT = """You are an evaluation judge for a retrieval-augmented generation (RAG) system in a medical Q&A research benchmark. Score the system output honestly.

QUESTION:
{question}

REFERENCE ANSWER (for calibration only, do not penalise wording differences):
{expected_answer}

RETRIEVED CONTEXT:
{context}

SYSTEM ANSWER:
{answer}

Respond with ONLY a JSON object, no prose:
{{
  "faithfulness": <0.0-1.0, fraction of claims in the answer that are supported by the retrieved context>,
  "answer_relevance": <0.0-1.0, how well the answer addresses the question>,
  "context_relevance": <0.0-1.0, how relevant the retrieved context is to the question>,
  "hallucination_rate": <0.0-1.0, fraction of answer claims NOT supported by the retrieved context>
}}"""


class LLMJudge:
    """Gemini-as-judge for generation metrics, with heuristic fallback."""

    name = "llm_judge"

    def __init__(
        self,
        generator=None,
        model: Optional[str] = None,
        fallback: Optional[HeuristicGenerationScorer] = None,
        timeout_retries: int = 2,
    ) -> None:
        """
        Parameters
        ----------
        generator : optional
            An object exposing ``generate(prompt) -> str`` (e.g. the
            production ``services.generator.Generator``). If None, a Gemini
            client is built lazily from ``GEMINI_API_KEY``.
        """
        self.generator = generator
        self.model = model
        self.timeout_retries = timeout_retries
        self.fallback = fallback or HeuristicGenerationScorer()
        self._client = None
        self._configured = True
        if generator is None:
            self._configured = self._init_client()

    def _init_client(self) -> bool:
        try:
            from config import GEMINI_API_KEY, GEMINI_MODEL

            if not GEMINI_API_KEY:
                return False
            from google import genai

            self._client = genai.Client(api_key=GEMINI_API_KEY)
            self.model = self.model or GEMINI_MODEL
            return True
        except Exception:
            return False

    @property
    def available(self) -> bool:
        return self._configured

    # ------------------------------------------------------------------
    def _judge_one(self, question, answer, contexts, expected_answer) -> Optional[Dict[str, float]]:
        context_block = "\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts)) or "(empty)"
        prompt = _JUDGE_PROMPT.format(
            question=question,
            expected_answer=expected_answer or "(not provided)",
            context=context_block[:8000],
            answer=answer,
        )
        last_error: Optional[Exception] = None
        for _ in range(self.timeout_retries + 1):
            try:
                if self.generator is not None:
                    raw = self.generator.generate(prompt)
                else:
                    resp = self._client.models.generate_content(model=self.model, contents=prompt)
                    raw = resp.text or ""
                parsed = json.loads(raw.strip().strip("`"))
                if not isinstance(parsed, dict):
                    continue
                return {
                    "faithfulness": max(0.0, min(1.0, float(parsed.get("faithfulness", 0.0)))),
                    "answer_relevance": max(0.0, min(1.0, float(parsed.get("answer_relevance", 0.0)))),
                    "context_relevance": max(0.0, min(1.0, float(parsed.get("context_relevance", 0.0)))),
                    "hallucination_rate": max(0.0, min(1.0, float(parsed.get("hallucination_rate", 0.0)))),
                }
            except Exception as e:  # noqa: BLE001
                last_error = e
        if last_error is not None:
            # Judge failed; degrade gracefully to the heuristic scores.
            return None
        return None

    def score(self, question, answer, contexts, expected_answer=None) -> Dict[str, float]:
        if self.available:
            judged = self._judge_one(question, answer, contexts, expected_answer)
            if judged is not None:
                judged["judge"] = self.name
                return judged
        fallback = self.fallback.score(question, answer, contexts, expected_answer)
        fallback["judge"] = self.fallback.name
        return fallback


# ======================================================================
# Aggregation
# ======================================================================
def evaluate_generation(
    samples: Sequence[Dict],
    scorer,
    context_fn: Callable[[Dict], List[str]],
    k: int = 5,
) -> Dict[str, float]:
    """
    Score a batch of generation samples.

    Parameters
    ----------
    samples : sequence of dicts
        Each has ``question``, ``answer``, ``expected_answer`` (optional).
    scorer : object with ``score(question, answer, contexts, expected_answer)``
    context_fn : callable
        ``context_fn(sample, k) -> List[str]`` returning retrieved context
        texts for the sample.
    """
    per_sample: List[Dict] = []
    for sample in samples:
        contexts = context_fn(sample, k)
        row = scorer.score(
            question=sample["question"],
            answer=sample.get("answer", ""),
            contexts=contexts,
            expected_answer=sample.get("expected_answer"),
        )
        row["query"] = sample.get("id", "")
        row["question"] = sample["question"]
        per_sample.append(row)

    keys = ["faithfulness", "hallucination_rate", "answer_relevance", "context_relevance"]
    agg = {key: mean_over_queries([r[key] for r in per_sample]) for key in keys}
    agg["judge"] = per_sample[0].get("judge", "heuristic") if per_sample else "none"
    agg["samples"] = len(per_sample)
    return {"aggregate": agg, "per_sample": per_sample}
