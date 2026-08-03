"""
services/intent_classifier.py

Intelligent retrieval strategy decider for Task 2.

Classifies incoming user messages into:
1. GREETING / CHITCHAT -> Skip vector retrieval
2. FOLLOWUP / ELABORATION -> Evaluate conversation history
3. MEDICAL_QUERY -> Perform dense vector search in ChromaDB
"""

import re
from typing import Set
from common.logging import logger


class IntentClassifier:
    """Classifies user intent to optimize vector database retrieval calls."""

    GREETING_WORDS: Set[str] = {
        "hi", "hello", "hey", "thanks", "thank", "thankyou",
        "ok", "okay", "bye", "goodbye", "cool", "great", "welcome"
    }

    FOLLOWUP_PATTERNS: Set[str] = {
        "explain more", "can you elaborate", "elaborate", "continue",
        "tell me more", "go on", "why", "how", "what about that", "again",
        "repeat", "what else", "explain"
    }

    MEDICAL_KEYWORDS: Set[str] = {
        "doctor", "medicine", "medication", "dosage", "prescription", "report",
        "blood", "pressure", "bp", "heart", "sugar", "glucose", "lab", "test",
        "result", "diagnosis", "symptom", "pain", "fever", "cough", "disease",
        "infection", "treatment", "visit", "hospital", "clinic", "summary",
        "allergy", "vital", "pulse", "mg", "tablet", "syrup", "asthma", "bronchitis"
    }

    def should_retrieve(self, question: str, has_history: bool = False) -> bool:
        """
        Determines whether vector retrieval is required for the question.
        """
        clean_q = question.strip().lower()
        normalized = re.sub(r"[^\w\s]", "", clean_q)
        tokens = set(normalized.split())

        # Rule 1: Explicit medical terms -> Perform retrieval
        if tokens & self.MEDICAL_KEYWORDS:
            logger.debug(f"[INTENT] Perform retrieval (Medical keyword matched): '{question}'")
            return True

        # Rule 2: Contains greeting/chit-chat words without medical terms -> Skip retrieval
        if tokens & self.GREETING_WORDS or normalized in self.GREETING_WORDS:
            logger.debug(f"[INTENT] Skip retrieval (Chit-chat/Greeting): '{question}'")
            return False

        # Rule 3: Short follow-up phrases when conversation history exists
        if normalized in self.FOLLOWUP_PATTERNS or any(fp in normalized for fp in self.FOLLOWUP_PATTERNS):
            if has_history:
                logger.debug(f"[INTENT] Skip retrieval (Follow-up relying on history): '{question}'")
                return False
            else:
                logger.debug(f"[INTENT] Perform retrieval (Follow-up without history): '{question}'")
                return True

        # Rule 4: Default for questions >= 3 words -> Perform retrieval
        if len(tokens) >= 3:
            logger.debug(f"[INTENT] Perform retrieval (Default multi-word query): '{question}'")
            return True

        logger.debug(f"[INTENT] Skip retrieval (Default short query): '{question}'")
        return False
