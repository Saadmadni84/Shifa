"""
tests/test_generator.py

Unit test for Generator service.
"""

import unittest
from services.generator import Generator


class TestGenerator(unittest.TestCase):

    def test_generator_prompt(self):
        gen = Generator()
        self.assertIsNotNone(gen.model)


if __name__ == "__main__":
    unittest.main()