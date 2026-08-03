"""
tests/test_db.py

Unit test for database query execution.
"""

import unittest
from db.postgres import execute_query


class TestDatabaseExecution(unittest.TestCase):

    def test_query_patients(self):
        query = "SELECT first_name, last_name FROM patients;"
        rows = execute_query(query)
        self.assertIsInstance(rows, list)


if __name__ == "__main__":
    unittest.main()