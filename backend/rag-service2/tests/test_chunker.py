"""
tests/test_chunker.py

Unit test for document chunking.
"""

import unittest
from services.loader import load_complete_patient
from services.document_builder import build_complete_documents
from services.chunker import DocumentChunker

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestDocumentChunker(unittest.TestCase):

    def test_chunking(self):
        patient = load_complete_patient(DEMO_PATIENT_ID)
        documents = build_complete_documents(patient)
        chunker = DocumentChunker()
        chunks = chunker.split_documents(documents)
        self.assertTrue(len(chunks) > 0)


if __name__ == "__main__":
    unittest.main()