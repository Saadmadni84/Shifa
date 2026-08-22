"""
services/retriever.py

Retrieves relevant documents using:
1. ChromaDB vector similarity search (patient-level)
2. PostgreSQL keyword search on rag_document_chunks (session-level)

Combines both sources for comprehensive context.
"""

from typing import List, Dict, Any, Optional
from langchain_core.documents import Document

from services.embedder import VectorStore
from db.document_repository import DocumentRepository
from config import DEFAULT_TOP_K
from common.logging import logger


class Retriever:
    """Handles semantic vector searches and PostgreSQL keyword searches."""

    def __init__(
        self,
        vector_store: Optional[VectorStore] = None,
        doc_repo: Optional[DocumentRepository] = None,
    ):
        self.vector_store = vector_store or VectorStore()
        self.doc_repo = doc_repo or DocumentRepository()

    def _build_filter(
        self,
        patient_id: Optional[str] = None,
        document_type: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Constructs metadata filter dictionary for ChromaDB."""
        conditions = []

        if patient_id:
            conditions.append({"patient_id": str(patient_id)})
        if document_type:
            conditions.append({"type": document_type})
        if session_id:
            conditions.append({"session_id": str(session_id)})

        if not conditions:
            return None
        if len(conditions) == 1:
            return conditions[0]
        return {"$and": conditions}

    def search(
        self,
        query: str,
        patient_id: Optional[str] = None,
        document_type: Optional[str] = None,
        session_id: Optional[str] = None,
        k: Optional[int] = None,
    ) -> List[Document]:
        """
        Executes dense similarity search in ChromaDB.
        """
        if not query or not query.strip():
            return []

        top_k = k if k is not None else DEFAULT_TOP_K
        filter_dict = self._build_filter(
            patient_id=patient_id,
            document_type=document_type,
            session_id=session_id,
        )

        try:
            results = self.vector_store.similarity_search(
                query=query.strip(),
                k=top_k,
                filter_dict=filter_dict,
            )
            logger.debug(f"[RETRIEVER] ChromaDB: Retrieved {len(results)} chunks")
            return results
        except Exception as e:
            logger.error(f"[RETRIEVER] Error during vector search: {e}")
            return []

    def search_session_chunks(
        self,
        query: str,
        session_id: str,
        patient_id: str,
        limit: int = 8,
    ) -> List[Document]:
        """
        Searches rag_document_chunks in PostgreSQL using full-text keyword search.
        Scoped to the given session.
        """
        if not query or not query.strip() or not session_id:
            return []

        try:
            # Try full-text search first
            results = self.doc_repo.search_chunks_by_keyword(
                session_id=session_id,
                patient_id=patient_id,
                search_query=query.strip(),
                limit=limit,
            )

            # If no FTS results, fall back to loading all session chunks
            if not results:
                results = self.doc_repo.get_chunks_by_session(
                    session_id=session_id,
                    patient_id=patient_id,
                    limit=limit,
                )

            documents = []
            for row in results:
                doc = Document(
                    page_content=row.get("content", ""),
                    metadata={
                        "type": row.get("document_type", "uploaded_document"),
                        "source": "postgresql",
                        "session_id": session_id,
                        "document_id": str(row.get("document_id", "")),
                        "chunk_index": row.get("chunk_index", 0),
                        "page_number": row.get("page_number"),
                        "section_heading": row.get("section_heading"),
                        "original_filename": row.get("original_filename", ""),
                    }
                )
                documents.append(doc)

            logger.debug(f"[RETRIEVER] PostgreSQL: Retrieved {len(documents)} session chunks for session '{session_id}'")
            return documents
        except Exception as e:
            logger.error(f"[RETRIEVER] PostgreSQL session chunk search error: {e}")
            return []

    def combined_search(
        self,
        query: str,
        session_id: str,
        patient_id: Optional[str] = None,
        k: int = None,
    ) -> List[Document]:
        """
        Combines ChromaDB vector search with PostgreSQL keyword search.
        Deduplicates results by content similarity.
        """
        top_k = k if k is not None else DEFAULT_TOP_K

        # 1. ChromaDB vector search (session-scoped if available, else patient-scoped)
        if not patient_id:
            return []

        vector_results = self.search(
            query=query,
            session_id=session_id,
            patient_id=patient_id,
            k=top_k,
        )

        # Also search by patient_id if provided (broader context)
        if patient_id:
            patient_results = self.search(
                query=query,
                patient_id=patient_id,
                k=top_k,
            )
            vector_results.extend(patient_results)

        # 2. PostgreSQL session chunk search
        pg_results = self.search_session_chunks(
            query=query,
            session_id=session_id,
            patient_id=patient_id,
            limit=top_k,
        )

        # 3. Combine and deduplicate
        seen_content = set()
        combined = []

        for doc in vector_results + pg_results:
            content_key = doc.page_content[:200].strip().lower()
            if content_key not in seen_content:
                seen_content.add(content_key)
                combined.append(doc)

        # Limit total results
        max_results = top_k * 2
        combined = combined[:max_results]

        logger.debug(f"[RETRIEVER] Combined search: {len(combined)} unique chunks (vector={len(vector_results)}, pg={len(pg_results)})")
        return combined