"""
tests/test_document_builder.py

Unit test for LangChain Document builder from patient profile and visit data.
"""

import unittest
from services.loader import load_complete_patient
from services.document_builder import build_complete_documents

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestDocumentBuilder(unittest.TestCase):

    def test_build_documents(self):
        patient_data = load_complete_patient(DEMO_PATIENT_ID)
        self.assertIsNotNone(patient_data)
        documents = build_complete_documents(patient_data)
        self.assertTrue(len(documents) > 0)
        self.assertIn("page_content", dir(documents[0]))


if __name__ == "__main__":
    unittest.main()