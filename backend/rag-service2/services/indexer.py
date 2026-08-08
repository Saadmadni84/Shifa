"""
services/indexer.py

Orchestrates incremental vector indexing per patient or document.
"""

from typing import Dict, Any, List, Optional
from langchain_core.documents import Document

from services.loader import load_complete_patient
from services.document_builder import build_complete_documents
from services.chunker import DocumentChunker
from services.embedder import VectorStore
from common.logging import logger
from common.exceptions import InvalidPatientError, VectorDBError


class Indexer:
    """Manages patient-level and document-level indexing into ChromaDB."""

    def __init__(
        self,
        chunker: Optional[DocumentChunker] = None,
        vector_store: Optional[VectorStore] = None
    ):
        self.chunker = chunker or DocumentChunker()
        self.vector_store = vector_store or VectorStore()

    def index_patient(self, patient_id: str) -> Dict[str, Any]:
        """Loads complete patient record, builds documents, chunks, and indexes into ChromaDB."""
        patient_data = load_complete_patient(patient_id)
        if not patient_data or not patient_data.get("patient"):
            raise InvalidPatientError(f"Patient '{patient_id}' not found.")

        documents = build_complete_documents(patient_data)
        chunks = self.chunker.split_documents(documents)
        ids = self.vector_store.add_documents(chunks)

        logger.info(f"[INDEXER] Indexed patient '{patient_id}': {len(documents)} docs, {len(chunks)} chunks.")

        return {
            "status": "success",
            "patient_id": patient_id,
            "documents_indexed": len(documents),
            "chunks_indexed": len(chunks),
            "collection_size": self.vector_store.count(),
            "generated_ids": ids,
        }

    def index_documents(self, documents: List[Document]) -> List[str]:
        """Indexes raw LangChain documents (e.g. from PDF/Audio ingestion) directly into ChromaDB."""
        if not documents:
            return []
        chunks = self.chunker.split_documents(documents)
        ids = self.vector_store.add_documents(chunks)
        return ids

    def reindex_patient(self, patient_id: str) -> Dict[str, Any]:
        """Deletes existing patient vectors and re-indexes from latest PostgreSQL state."""
        self.vector_store.delete_patient(patient_id)
        return self.index_patient(patient_id)

    def delete_patient(self, patient_id: str) -> Dict[str, Any]:
        """Deletes all vectors belonging to a patient."""
        self.vector_store.delete_patient(patient_id)
        return {
            "status": "success",
            "message": f"Patient '{patient_id}' deleted from vector database."
        }

    def reset_database(self) -> Dict[str, Any]:
        """Deletes all vectors from the collection."""
        self.vector_store.reset_collection()
        return {
            "status": "success",
            "message": "Vector database reset successfully."
        }

    def collection_stats(self) -> Dict[str, Any]:
        """Returns vector collection metrics."""
        return {
            "collection_name": self.vector_store.COLLECTION_NAME,
            "total_vectors": self.vector_store.count()
        }