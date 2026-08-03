"""
tests/test_loader.py

Unit test for database patient loader.
"""

import unittest
from services.loader import load_complete_patient

DEMO_PATIENT_ID = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"


class TestPatientLoader(unittest.TestCase):

    def test_load_patient(self):
        data = load_complete_patient(DEMO_PATIENT_ID)
        self.assertIsNotNone(data)
        self.assertIn("patient", data)
        self.assertIn("visits", data)


if __name__ == "__main__":
    unittest.main()