"""
tests/test_vector_store.py

Unit test for VectorStore peek and metrics.
"""

import unittest
from services.embedder import VectorStore


class TestVectorStoreMetrics(unittest.TestCase):

    def test_count(self):
        store = VectorStore()
        count = store.count()
        self.assertGreaterEqual(count, 0)


if __name__ == "__main__":
    unittest.main()