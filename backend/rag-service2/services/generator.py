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
            return self._generate_rule_fallback(prompt), {"latency_ms": 0.0, "tokens_used": 0, "model": self.model}

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
            self._generate_rule_fallback(prompt),
            {"latency_ms": 0.0, "tokens_used": 0, "model": self.model, "error": str(last_error)}
        )

    def _generate_rule_fallback(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        
        # Extract current question accurately
        question_section = prompt_lower
        if "current question" in prompt_lower:
            try:
                raw_q = prompt.split("CURRENT QUESTION")[1].split("STRICT ANSWER")[0]
                question_section = raw_q.replace("=", "").strip().lower()
            except Exception:
                question_section = prompt_lower

        # 1. Greetings
        if any(w in question_section.split() for w in ["hi", "hello", "hey", "greetings", "good morning", "good evening"]):
            return "Hello! I am Shifa AI, your personal health assistant. I'm connected to your Shifa health profile and medical records. How can I assist you with your health today?"

        # 2. Symptom: Fever
        if "fever" in question_section:
            return "If you have a fever, please rest, stay well-hydrated with water or warm fluids, and monitor your body temperature. You may take over-the-counter antipyretics like Paracetamol (Acetaminophen) if appropriate for you. Seek immediate medical attention if your fever exceeds 102°F (38.9°C), lasts longer than 3 days, or is accompanied by chest pain or difficulty breathing."

        # 3. Symptom: Headache
        if "headache" in question_section:
            return "For a headache, stay hydrated, rest in a quiet dark room, and avoid screen strain. If your headache is sudden, severe, or accompanied by fever or vision changes, please consult a doctor promptly."

        # 4. Symptom: Cough / Cold
        if "cough" in question_section or "cold" in question_section:
            return "For a cough or cold, stay warm, drink plenty of fluids, rest, and consider warm steam inhalation. If you develop shortness of breath or high fever, please seek medical evaluation."

        # 5. Check if retrieved patient context has actual medical data
        if "retrieved patient context" in prompt_lower:
            parts = prompt.split("RETRIEVED PATIENT CONTEXT")
            if len(parts) > 1:
                context_text = parts[1].split("=")[0].strip()
                if "no specific medical documents retrieved" not in context_text.lower() and len(context_text) > 30:
                    lines = [l.strip() for l in context_text.split("\n") if l.strip() and not l.startswith("---")]
                    snippet = "\n".join(lines[:8])
                    return f"Based on your medical records in Shifa:\n\n{snippet}\n\nPlease consult your healthcare provider if you have any questions!"

        return "I am connected to your Shifa health profile. You currently don't have any specific visit records matching this query, but feel free to ask about your diagnoses, medications, or general health questions!"