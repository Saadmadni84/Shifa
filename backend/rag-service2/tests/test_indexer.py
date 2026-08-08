"""
tests/test_indexer.py

Unit test for Indexer service.
"""

import unittest
from services.indexer import Indexer

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestIndexer(unittest.TestCase):

    def test_reindex_patient(self):
        indexer = Indexer()
        result = indexer.reindex_patient(DEMO_PATIENT_ID)
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["patient_id"], DEMO_PATIENT_ID)
        self.assertTrue(result["chunks_indexed"] > 0)


if __name__ == "__main__":
    unittest.main()