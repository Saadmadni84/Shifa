"""
services/conversation.py

Handles token-efficient chatbot conversation memory and session state.

Responsibilities
----------------
1. Load recent conversation history
2. Format history within configurable token limit using tiktoken
3. Save user messages and assistant responses
"""

from typing import List, Dict, Any, Tuple
import tiktoken

from db.chat_repository import ChatRepository
from config import (
    MAX_HISTORY_MESSAGES,
    MAX_HISTORY_TOKENS,
    TOKEN_ENCODING_NAME,
)
from common.logging import logger


class ConversationService:
    """Manages chat history formatting, truncation, and persistence."""

    def __init__(self):
        self.repo = ChatRepository()
        try:
            self.tokenizer = tiktoken.get_encoding(TOKEN_ENCODING_NAME)
        except Exception:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        """Estimate token count for a text string."""
        if not text:
            return 0
        return len(self.tokenizer.encode(text))

    def get_history(self, session_id: str, patient_id: str, limit: int = MAX_HISTORY_MESSAGES) -> List[Dict[str, Any]]:
        """Fetch raw chat history from repository."""
        return self.repo.get_messages(session_id, patient_id, limit=limit)

    def format_history(self, session_id: str, patient_id: str, limit: int = MAX_HISTORY_MESSAGES) -> str:
        """
        Formats conversation history into a clean string, ensuring total tokens
        do not exceed MAX_HISTORY_TOKENS.
        """
        messages = self.get_history(session_id, patient_id, limit=limit)
        if not messages:
            return ""

        formatted_blocks: List[Tuple[str, int]] = []
        for msg in messages:
            role = msg.get("role", "user").lower()
            prefix = "User" if role == "user" else ("Assistant" if role == "assistant" else role.capitalize())
            content = msg.get("content", "").strip()
            block = f"{prefix}:\n{content}"
            tokens = self.count_tokens(block)
            formatted_blocks.append((block, tokens))

        # Enforce MAX_HISTORY_TOKENS budget from most recent backwards
        selected_blocks: List[str] = []
        accumulated_tokens = 0

        for block, tokens in reversed(formatted_blocks):
            if accumulated_tokens + tokens > MAX_HISTORY_TOKENS:
                break
            selected_blocks.append(block)
            accumulated_tokens += tokens

        selected_blocks.reverse()
        return "\n\n".join(selected_blocks)

    def save_user_message(self, session_id: str, message: str, language_code: str = "en") -> bool:
        """Saves user message to repository."""
        tokens = self.count_tokens(message)
        return self.repo.save_message(
            session_id=session_id,
            role="user",
            content=message,
            language_code=language_code,
            tokens_used=tokens,
            created_by="USER"
        )

    def save_assistant_message(
        self,
        session_id: str,
        message: str,
        language_code: str = "en",
        tokens_used: int = None
    ) -> bool:
        """Saves assistant response to repository."""
        if tokens_used is None:
            tokens_used = self.count_tokens(message)

        return self.repo.save_message(
            session_id=session_id,
            role="assistant",
            content=message,
            language_code=language_code,
            tokens_used=tokens_used,
            created_by="SHIFA_AI"
        )

    def save_exchange(
        self,
        session_id: str,
        patient_id: str,
        user_message: str,
        assistant_message: str,
        language_code: str = "en",
        assistant_tokens: int = None
    ) -> None:
        """Saves both user and assistant messages."""
        self.repo.save_message(session_id, "user", user_message, language_code,
                       self.count_tokens(user_message), "USER", patient_id)
        self.repo.save_message(session_id, "assistant", assistant_message, language_code,
                       assistant_tokens, "SHIFA_AI", patient_id)