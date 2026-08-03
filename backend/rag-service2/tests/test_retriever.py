"""
tests/test_retriever.py

Unit test for Retriever service.
"""

import unittest
from services.retriever import Retriever

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestRetriever(unittest.TestCase):

    def test_search(self):
        retriever = Retriever()
        docs = retriever.search(query="bronchitis cough", patient_id=DEMO_PATIENT_ID)
        self.assertIsInstance(docs, list)


if __name__ == "__main__":
    unittest.main()