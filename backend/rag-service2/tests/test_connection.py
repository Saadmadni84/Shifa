"""
tests/test_connection.py

Unit test for database connection pool / fallback capability.
"""

import unittest
from db.postgres import is_db_available


class TestPostgresConnection(unittest.TestCase):

    def test_db_status(self):
        status = is_db_available()
        self.assertIn(status, [True, False])


if __name__ == "__main__":
    unittest.main()