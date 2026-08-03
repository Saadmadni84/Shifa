"""
tests/test_embedder.py

Unit test for VectorStore document insertion into ChromaDB.
"""

import unittest
from services.loader import load_complete_patient
from services.document_builder import build_complete_documents
from services.chunker import DocumentChunker
from services.embedder import VectorStore

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestVectorEmbedder(unittest.TestCase):

    def test_add_documents(self):
        patient = load_complete_patient(DEMO_PATIENT_ID)
        documents = build_complete_documents(patient)
        chunker = DocumentChunker()
        chunks = chunker.split_documents(documents)
        vector_store = VectorStore()
        ids = vector_store.add_documents(chunks)
        self.assertTrue(len(ids) > 0)


if __name__ == "__main__":
    unittest.main()