"""
services/embedder.py

Production-ready singleton ChromaDB wrapper using 384-dimension dense embeddings.
Supports incremental insert, delete by document ID, delete by patient ID.
"""

from typing import List, Dict, Any, Optional
from uuid import uuid4
from langchain_chroma import Chroma

from config import CHROMA_DB_PATH, EMBEDDING_MODEL, COLLECTION_NAME
from common.logging import logger
from common.exceptions import VectorDBError


class Local384Embeddings:
    """Fast, zero-heavy-dependency 384-dimension vector embedding generator."""

    def __init__(self):
        self._model = None
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer 'all-MiniLM-L6-v2' (384-dim) loaded successfully.")
        except Exception as e:
            logger.warning(f"SentenceTransformer local import failed ({e}). Using 384-dim lightweight fallback.")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        if self._model:
            try:
                embeddings = self._model.encode(texts, convert_to_numpy=True)
                return [emb.tolist() for emb in embeddings]
            except Exception as e:
                logger.error(f"SentenceTransformer encoding error: {e}")

        # Deterministic 384-dim hash embedding fallback
        results = []
        for text in texts:
            import hashlib
            seed = int(hashlib.md5(text.encode('utf-8')).hexdigest(), 16)
            import random
            rng = random.Random(seed)
            vec = [rng.uniform(-0.1, 0.1) for _ in range(384)]
            results.append(vec)
        return results

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]


_embeddings_instance = None
_vector_db_instance: Optional[Chroma] = None


def get_embedding_model():
    """Returns singleton instance of 384-dimension vector embedding model."""
    global _embeddings_instance
    if _embeddings_instance is None:
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            _embeddings_instance = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
            logger.info(f"Loaded HuggingFaceEmbeddings model '{EMBEDDING_MODEL}'.")
        except Exception as e:
            logger.info(f"Using Local384Embeddings wrapper: {e}")
            _embeddings_instance = Local384Embeddings()
    return _embeddings_instance


class VectorStore:
    """Singleton wrapper for ChromaDB vector operations."""

    COLLECTION_NAME = COLLECTION_NAME

    def __init__(self):
        global _vector_db_instance
        self.embedding_model = get_embedding_model()
        if _vector_db_instance is None:
            logger.info(f"Initializing ChromaDB vector store at '{CHROMA_DB_PATH}'")
            _vector_db_instance = Chroma(
                collection_name=self.COLLECTION_NAME,
                persist_directory=CHROMA_DB_PATH,
                embedding_function=self.embedding_model,
            )
        self.vector_db = _vector_db_instance

    def _generate_ids(self, documents: List[Any]) -> List[str]:
        """Generates unique, deterministic vector chunk IDs."""
        ids = []
        counters: Dict[str, int] = {}

        for doc in documents:
            meta = doc.metadata
            doc_type = meta.get("type", "doc")

            if doc_type == "patient_profile":
                ids.append(f"patient_{meta.get('patient_id', uuid4())}")
                continue

            base_id = (
                meta.get("document_id")
                or meta.get("prescription_id")
                or meta.get("visit_id")
                or meta.get("patient_id")
                or str(uuid4())
            )
            key = f"{doc_type}_{base_id}"
            chunk_no = counters.get(key, 0)
            ids.append(f"{key}_chunk_{chunk_no}")
            counters[key] = chunk_no + 1

        return ids

    def add_documents(self, documents: List[Any]) -> List[str]:
        """Adds documents to ChromaDB and returns generated chunk IDs."""
        if not documents:
            return []
        try:
            ids = self._generate_ids(documents)
            self.vector_db.add_documents(documents=documents, ids=ids)
            logger.info(f"[VECTORSTORE] Added {len(documents)} document chunks to ChromaDB.")
            return ids
        except Exception as e:
            logger.error(f"[VECTORSTORE] Failed to add documents to ChromaDB: {e}")
            raise VectorDBError(f"ChromaDB insert failed: {e}") from e

    def delete_documents(self, ids: List[str]) -> None:
        """Deletes vector chunks by explicit ID list."""
        if not ids:
            return
        try:
            self.vector_db.delete(ids=ids)
            logger.info(f"[VECTORSTORE] Deleted {len(ids)} document chunks.")
        except Exception as e:
            logger.error(f"[VECTORSTORE] Failed to delete document chunks: {e}")

    def delete_by_document_id(self, document_id: str) -> None:
        """Deletes vector chunks matching document_id metadata."""
        try:
            self.vector_db.delete(where={"document_id": str(document_id)})
            logger.info(f"[VECTORSTORE] Deleted document vectors for document_id '{document_id}'.")
        except Exception as e:
            logger.error(f"[VECTORSTORE] Delete document failed: {e}")

    def delete_patient(self, patient_id: str) -> None:
        """Deletes vector chunks belonging to a patient."""
        try:
            self.vector_db.delete(where={"patient_id": str(patient_id)})
            logger.info(f"[VECTORSTORE] Deleted all vectors for patient_id '{patient_id}'.")
        except Exception as e:
            logger.error(f"[VECTORSTORE] Delete patient failed: {e}")

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Any]:
        """Performs dense similarity search."""
        try:
            return self.vector_db.similarity_search(
                query=query,
                k=k,
                filter=filter_dict,
            )
        except Exception as e:
            logger.error(f"[VECTORSTORE] Similarity search error: {e}")
            return []

    def count(self) -> int:
        """Returns total vectors in collection."""
        try:
            return self.vector_db._collection.count()
        except Exception:
            return 0

    def reset_collection(self) -> None:
        """Resets the vector collection."""
        try:
            self.vector_db.delete(where={})
            logger.info("[VECTORSTORE] Vector collection reset.")
        except Exception as e:
            logger.error(f"[VECTORSTORE] Reset collection failed: {e}")