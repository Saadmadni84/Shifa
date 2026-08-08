"""
db/document_repository.py

Repository for RAG document metadata and parsed content chunks.

Responsibilities
----------------
1. Save document upload metadata (no binary files stored)
2. Save parsed content chunks with ordering and section info
3. Retrieve chunks by session or document for chatbot retrieval
4. Full-text search across chunks within a session
"""

from typing import List, Dict, Any, Optional
from uuid import uuid4
from db.postgres import execute_query, execute_non_query, get_db_transaction
from common.logging import logger


class DocumentRepository:
    """Handles persistence of parsed document chunks in PostgreSQL."""

    def save_document(
        self,
        session_id: str,
        document_type: str,
        original_filename: str,
        file_hash: Optional[str] = None,
        file_size_bytes: Optional[int] = None,
        total_pages: Optional[int] = None,
        total_chunks: int = 0,
    ) -> str:
        """Saves document metadata and returns generated UUID."""
        doc_id = str(uuid4())
        query = """
        INSERT INTO rag_documents (
            id, session_id, document_type, original_filename,
            file_hash, file_size_bytes, total_pages, total_chunks,
            processing_status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'completed', NOW(), NOW());
        """
        success = execute_non_query(
            query,
            (doc_id, session_id, document_type, original_filename,
             file_hash, file_size_bytes, total_pages, total_chunks)
        )
        if not success:
            logger.warning("Failed to insert rag_documents record (DB may be offline).")
        return doc_id

    def update_chunk_count(self, document_id: str, total_chunks: int) -> bool:
        """Updates the total_chunks count after processing."""
        query = """
        UPDATE rag_documents
        SET total_chunks = %s, updated_at = NOW()
        WHERE id = %s;
        """
        return execute_non_query(query, (total_chunks, document_id))

    def save_chunks(
        self,
        document_id: str,
        chunks: List[Dict[str, Any]]
    ) -> int:
        """
        Bulk inserts parsed content chunks with ordering.

        Each chunk dict should have:
        - content: str (required)
        - chunk_index: int (required)
        - page_number: int (optional)
        - section_heading: str (optional)
        - metadata: dict (optional)
        """
        if not chunks:
            return 0

        query = """
        INSERT INTO rag_document_chunks (
            id, document_id, chunk_index, content,
            page_number, section_heading, chunk_metadata, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, NOW());
        """

        inserted = 0
        try:
            with get_db_transaction() as (_, cursor):
                if cursor is None:
                    return 0
                for chunk in chunks:
                    chunk_id = str(uuid4())
                    import json
                    metadata_json = json.dumps(chunk.get("metadata", {}))
                    cursor.execute(
                        query,
                        (
                            chunk_id,
                            document_id,
                            chunk.get("chunk_index", inserted),
                            chunk["content"],
                            chunk.get("page_number"),
                            chunk.get("section_heading"),
                            metadata_json,
                        )
                    )
                    inserted += 1
            logger.info(f"[DOC_REPO] Saved {inserted} chunks for document '{document_id}'.")
        except Exception as e:
            logger.error(f"[DOC_REPO] Failed to save chunks: {e}")

        return inserted

    def get_chunks_by_session(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Retrieves all chunks for documents uploaded in a given session."""
        query = """
        SELECT
            c.id, c.document_id, c.chunk_index, c.content,
            c.page_number, c.section_heading, c.chunk_metadata,
            d.document_type, d.original_filename
        FROM rag_document_chunks c
        JOIN rag_documents d ON c.document_id = d.id
        WHERE d.session_id = %s
        ORDER BY d.created_at ASC, c.chunk_index ASC
        LIMIT %s;
        """
        return execute_query(query, (session_id, limit))

    def get_chunks_by_document(
        self,
        document_id: str
    ) -> List[Dict[str, Any]]:
        """Retrieves all chunks for a specific document, ordered by chunk_index."""
        query = """
        SELECT
            id, document_id, chunk_index, content,
            page_number, section_heading, chunk_metadata
        FROM rag_document_chunks
        WHERE document_id = %s
        ORDER BY chunk_index ASC;
        """
        return execute_query(query, (document_id,))

    def search_chunks_by_keyword(
        self,
        session_id: str,
        search_query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Full-text keyword search across chunks within a session.
        Uses PostgreSQL's tsvector/tsquery for efficient matching.
        """
        query = """
        SELECT
            c.id, c.document_id, c.chunk_index, c.content,
            c.page_number, c.section_heading,
            d.document_type, d.original_filename,
            ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', %s)) AS rank
        FROM rag_document_chunks c
        JOIN rag_documents d ON c.document_id = d.id
        WHERE d.session_id = %s
          AND to_tsvector('english', c.content) @@ plainto_tsquery('english', %s)
        ORDER BY rank DESC
        LIMIT %s;
        """
        return execute_query(query, (search_query, session_id, search_query, limit))

    def get_documents_by_session(
        self,
        session_id: str
    ) -> List[Dict[str, Any]]:
        """Returns all document metadata for a session."""
        query = """
        SELECT
            id, session_id, document_type, original_filename,
            file_hash, file_size_bytes, total_pages, total_chunks,
            processing_status, created_at
        FROM rag_documents
        WHERE session_id = %s
        ORDER BY created_at ASC;
        """
        return execute_query(query, (session_id,))
