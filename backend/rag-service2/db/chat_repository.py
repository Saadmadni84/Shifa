"""
db/chat_repository.py

Repository for RAG chat sessions, messages, and session statistics.

Responsibilities
----------------
1. Auto-create or retrieve chat sessions (upsert pattern)
2. Fetch recent chat history from rag_chat_messages
3. Save chat messages and update session statistics atomically
4. Soft delete chat messages (clear chat)
5. Ensure session isolation
"""

from typing import List, Dict, Any, Optional
from db.postgres import execute_query, execute_single_query, get_db_transaction
from common.logging import logger


class ChatRepository:
    """Handles database persistence for chatbot conversations and sessions."""

    def get_chat_context(self, session_id: str, patient_id: str) -> Dict[str, Any]:
        """
        Returns chat session details. Auto-creates session if not found.
        Uses rag_chat_sessions table (RAG-service owned).
        """
        query = """
        SELECT id AS session_id, patient_id, created_at, total_messages, total_tokens
        FROM rag_chat_sessions
        WHERE id = %s AND patient_id = %s;
        """
        result = execute_single_query(query, (session_id, patient_id))
        if result:
            return result

        # Auto-create session for seamless usage
        insert_query = """
        INSERT INTO rag_chat_sessions (id, patient_id, created_at, updated_at, total_messages, total_tokens)
        VALUES (%s, %s, NOW(), NOW(), 0, 0)
        ON CONFLICT (id) DO NOTHING;
        """
        try:
            with get_db_transaction() as (_, cursor):
                if cursor:
                    cursor.execute(insert_query, (session_id, patient_id))
        except Exception as e:
            logger.warning(f"Session auto-create skipped (DB may be offline): {e}")

        result = execute_single_query(query, (session_id, patient_id))
        if result:
            logger.info(f"Created RAG chat session for patient '{patient_id}'.")
        return result

    def get_messages(self, session_id: str, patient_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Returns the most recent non-deleted chat messages ordered chronologically.
        """
        query = """
        SELECT
            id,
            role,
            content,
            language_code,
            tokens_used,
            created_at
        FROM (
            SELECT
                id,
                role,
                content,
                language_code,
                tokens_used,
                created_at
            FROM rag_chat_messages
            WHERE session_id = %s
              AND deleted = FALSE
                            AND EXISTS (
                                    SELECT 1 FROM rag_chat_sessions s
                                    WHERE s.id = session_id AND s.patient_id = %s
                            )
            ORDER BY created_at DESC
            LIMIT %s
        ) AS recent_messages
        ORDER BY created_at ASC;
        """
        return execute_query(query, (session_id, patient_id, limit))

    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        language_code: str = "en",
        tokens_used: Optional[int] = None,
        created_by: str = "SYSTEM",
        patient_id: str = None
    ) -> bool:
        """
        Saves a single chat message and updates session statistics.
        """
        insert_query = """
        INSERT INTO rag_chat_messages (
            session_id,
            role,
            content,
            language_code,
            tokens_used,
            created_by,
            created_at
                ) SELECT %s, %s, %s, %s, %s, %s, NOW()
                    WHERE EXISTS (
                            SELECT 1 FROM rag_chat_sessions
                            WHERE id = %s AND patient_id = %s
                    );
        """

        update_session_query = """
        UPDATE rag_chat_sessions
        SET total_messages = total_messages + 1,
            total_tokens = total_tokens + COALESCE(%s, 0),
            last_message_at = NOW(),
            updated_at = NOW()
        WHERE id = %s AND patient_id = %s;
        """

        try:
            with get_db_transaction() as (_, cursor):
                if cursor:
                    cursor.execute(
                        insert_query,
                        (session_id, role, content, language_code, tokens_used, created_by, session_id, patient_id)
                    )
                    cursor.execute(
                        update_session_query,
                        (tokens_used or 0, session_id, patient_id)
                    )
            return True
        except Exception as e:
            logger.warning(f"Message save skipped (DB Offline/Fallback): {e}")
            return True

    def clear_messages(self, session_id: str) -> bool:
        """Soft deletes all messages for a given session."""
        query = """
        UPDATE rag_chat_messages
        SET
            deleted = TRUE,
            deleted_at = NOW(),
            delete_reason = 'Conversation Cleared'
        WHERE session_id = %s;
        """
        try:
            with get_db_transaction() as (_, cursor):
                if cursor:
                    cursor.execute(query, (session_id,))
            return True
        except Exception as e:
            logger.error(f"Failed to clear messages for session {session_id}: {e}")
            return False

    def get_session_stats(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Returns session statistics."""
        query = """
        SELECT id AS session_id, total_messages, total_tokens,
               created_at, updated_at, last_message_at
        FROM rag_chat_sessions
        WHERE id = %s;
        """
        return execute_single_query(query, (session_id,))