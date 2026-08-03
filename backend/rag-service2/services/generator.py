"""
services/generator.py

Wrapper for Google Gemini API calls using google-genai SDK.
Handles retry logic, rate limit fallbacks, and usage metrics tracking.
"""

import time
from typing import Optional, Dict, Any, Tuple
from google import genai

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_MAX_RETRIES
from common.exceptions import LLMGenerationError
from common.logging import logger


class Generator:
    """Handles Gemini content generation with retry logic and fallback error management."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        key = api_key or GEMINI_API_KEY
        if not key:
            logger.warning("GEMINI_API_KEY is not set in environment or config.")

        self.client = genai.Client(api_key=key) if key else None
        self.model = model or GEMINI_MODEL

    def generate(self, prompt: str) -> str:
        """Generates text response from Gemini given a prompt string."""
        text, _ = self.generate_with_stats(prompt)
        return text

    def generate_with_stats(self, prompt: str) -> Tuple[str, Dict[str, Any]]:
        """
        Generates response text and returns usage stats (tokens, latency).
        """
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if not self.client:
            return "I couldn't find that information in the patient's records.", {"latency_ms": 0, "model": self.model}

        retries = 0
        last_error = None

        while retries < GEMINI_MAX_RETRIES:
            try:
                start_time = time.perf_counter()
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

                if response and response.text:
                    answer_text = response.text.strip()
                    tokens_used = None
                    if hasattr(response, "usage_metadata") and response.usage_metadata:
                        tokens_used = getattr(response.usage_metadata, "total_token_count", None)

                    stats = {
                        "latency_ms": elapsed_ms,
                        "tokens_used": tokens_used,
                        "model": self.model
                    }
                    return answer_text, stats

            except Exception as e:
                retries += 1
                last_error = e
                logger.warning(f"Gemini generation attempt {retries}/{GEMINI_MAX_RETRIES} failed: {e}")
                time.sleep(0.5 * retries)

        logger.error(f"[GENERATOR] Gemini generation failed ({last_error}). Returning fallback response.")
        return (
            "I couldn't find that information in the patient's records.",
            {"latency_ms": 0.0, "tokens_used": 0, "model": self.model, "error": str(last_error)}
        )