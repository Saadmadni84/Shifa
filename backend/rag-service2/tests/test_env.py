"""
tests/test_env.py

Unit test for checking environment variables and configuration.
"""

import unittest
from config import GEMINI_MODEL, CHROMA_DB_PATH


class TestEnvConfig(unittest.TestCase):

    def test_configuration(self):
        self.assertIsNotNone(GEMINI_MODEL)
        self.assertIsNotNone(CHROMA_DB_PATH)


if __name__ == "__main__":
    unittest.main()