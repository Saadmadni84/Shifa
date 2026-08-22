"""
services/chat_service.py

Main orchestration service for the Medical RAG Chatbot.

Pipeline Workflow
-----------------
1. Validate session ID & auto-create session if needed
2. Format token-efficient conversation history
3. Decide whether vector retrieval is required (IntentClassifier)
4. Perform combined search: ChromaDB + PostgreSQL session chunks
5. Build structured anti-hallucination prompt
6. Generate answer using Gemini LLM
7. Save exchange to database & update session statistics
8. Return answer with sources and stage latencies
"""

import time
from typing import Dict, Any, List, Optional
from langchain_core.documents import Document

from db.chat_repository import ChatRepository
from services.conversation import ConversationService
from services.intent_classifier import IntentClassifier
from services.retriever import Retriever
from services.prompt_builder import PromptBuilder
from services.generator import Generator
from common.exceptions import InvalidSessionError
from common.logging import logger


class ChatService:
    """Main application service coordinating conversation, retrieval, prompting, and LLM generation."""

    def __init__(
        self,
        repository: Optional[ChatRepository] = None,
        conversation: Optional[ConversationService] = None,
        intent_classifier: Optional[IntentClassifier] = None,
        retriever: Optional[Retriever] = None,
        prompt_builder: Optional[PromptBuilder] = None,
        generator: Optional[Generator] = None,
    ):
        self.repository = repository or ChatRepository()
        self.conversation = conversation or ConversationService()
        self.intent_classifier = intent_classifier or IntentClassifier()
        self.retriever = retriever or Retriever()
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.generator = generator or Generator()
        from services.indexer import Indexer
        self.indexer = Indexer()

    def chat(self, session_id: str, question: str, patient_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes a chat turn for a given session and user question.
        Uses combined retrieval from ChromaDB and PostgreSQL session chunks.
        """
        start_total = time.perf_counter()
        latencies = {
            "intent_classification_ms": 0.0,
            "retrieval_ms": 0.0,
            "prompt_building_ms": 0.0,
            "generation_ms": 0.0,
            "total_ms": 0.0
        }

        # 1. Validate / Auto-Create Chat Session
        chat_context = self.repository.get_chat_context(session_id, patient_id)
        if not chat_context:
            logger.warning(f"Invalid or deleted chat session: '{session_id}'")
            raise InvalidSessionError(f"Chat session '{session_id}' not found or deleted.")

        # Load Patient Structured Database Context
        patient_ctx_str = ""
        if patient_id:
            try:
                from services.loader import load_complete_patient, build_patient_context_string
                p_data = load_complete_patient(patient_id)
                if p_data:
                    patient_ctx_str = build_patient_context_string(p_data)

                self.indexer.index_patient(patient_id)
            except Exception as e:
                logger.warning(f"Patient context/indexing for '{patient_id}' skipped/warned: {e}")

        # session_id is the primary key for retrieval scope
        language = "en"

        # 2. Conversation History
        history = self.conversation.format_history(session_id=session_id, patient_id=patient_id)
        has_history = bool(history.strip())

        # 3. Intent Classification
        with _Timer("Intent Classification") as t:
            should_retrieve = self.intent_classifier.should_retrieve(question, has_history=has_history)
        latencies["intent_classification_ms"] = t.elapsed_ms

        # 4. Combined Retrieval from ChromaDB + PostgreSQL
        documents: List[Document] = []
        if should_retrieve:
            with _Timer("Combined Retrieval") as t:
                documents = self.retriever.combined_search(
                    query=question,
                    session_id=session_id,
                    patient_id=patient_id,
                )
            latencies["retrieval_ms"] = t.elapsed_ms

        # 5. Prompt Construction
        with _Timer("Prompt Building") as t:
            prompt = self.prompt_builder.build(
                question=question,
                patient_context=patient_ctx_str,
                documents=documents,
                conversation_history=history
            )
        latencies["prompt_building_ms"] = t.elapsed_ms

        # 6. Gemini LLM Answer Generation
        with _Timer("Gemini Generation") as t:
            answer, gen_stats = self.generator.generate_with_stats(prompt)
        latencies["generation_ms"] = t.elapsed_ms

        # 7. Save Conversation & Update Session Stats
        tokens_used = gen_stats.get("tokens_used")
        self.conversation.save_exchange(
            session_id=session_id,
            patient_id=patient_id,
            user_message=question,
            assistant_message=answer,
            language_code=language,
            assistant_tokens=tokens_used
        )

        total_elapsed = round((time.perf_counter() - start_total) * 1000, 2)
        latencies["total_ms"] = total_elapsed

        # 8. Build Response Sources
        sources = [
            {
                "document_type": doc.metadata.get("type", "unknown"),
                "content_snippet": doc.page_content[:200] + "...",
                "metadata": doc.metadata
            }
            for doc in documents
        ]

        logger.info(f"[CHAT_SERVICE] Patient chat completed: patient_id={patient_id}, retrieval={should_retrieve}, docs={len(documents)}, elapsed_ms={total_elapsed}")

        return {
            "session_id": session_id,
            "question": question,
            "answer": answer,
            "retrieval_performed": should_retrieve,
            "sources": sources,
            "latencies": latencies
        }


class _Timer:
    """Inline timer context manager for latency tracking."""

    def __init__(self, name: str):
        self.name = name
        self.elapsed_ms: float = 0.0
        self._start: float = 0.0

    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed_ms = round((time.perf_counter() - self._start) * 1000, 2)