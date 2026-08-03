"""
tests/test_pdf_ingestion.py

Comprehensive tests for PDF upload, parsing, chunking, and PostgreSQL storage.
"""

import unittest
import io
import os
import sys

# Ensure rag-service2 is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app import app


class TestPDFIngestion(unittest.TestCase):
    """Comprehensive PDF ingestion test suite."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.patient_id = "test-pdf-patient-001"
        cls.session_id = "test-pdf-session-001"
        cls.visit_id = "test-pdf-visit-001"

    # ----- Helper: Generate a minimal valid PDF -----
    @staticmethod
    def _make_minimal_pdf() -> bytes:
        """Creates a minimal valid PDF file with extractable text."""
        return (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n"
            b"0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
        )

    @staticmethod
    def _make_text_pdf() -> bytes:
        """Creates a PDF with actual text content using reportlab if available."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph
            from reportlab.lib.styles import getSampleStyleSheet

            buf = io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = [
                Paragraph("PATIENT MEDICAL REPORT", styles["Title"]),
                Paragraph("Patient Name: Hari Patel", styles["Normal"]),
                Paragraph("Diagnosis: Acute Bronchitis with mild asthma exacerbation", styles["Normal"]),
                Paragraph("Blood Pressure: 128/82 mmHg", styles["Normal"]),
                Paragraph("Heart Rate: 92 bpm", styles["Normal"]),
                Paragraph("Temperature: 100.2 F", styles["Normal"]),
                Paragraph("Medications: Amoxicillin 500mg three times daily for 7 days. "
                          "Azithromycin 500mg once daily for 3 days. "
                          "Montelukast 10mg at bedtime for 30 days.", styles["Normal"]),
                Paragraph("Follow-up: August 4, 2026", styles["Normal"]),
            ]
            doc.build(elements)
            return buf.getvalue()
        except ImportError:
            # Fallback to minimal PDF
            return TestPDFIngestion._make_minimal_pdf()

    # ----- Test Cases -----

    def test_01_upload_succeeds(self):
        """Verify PDF upload returns 200 with success status."""
        pdf_bytes = self._make_minimal_pdf()
        files = {"file": ("test_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["patient_id"], self.patient_id)

    def test_02_parsing_succeeds(self):
        """Verify PDF text extraction produces non-empty content."""
        pdf_bytes = self._make_text_pdf()
        files = {"file": ("detailed_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertGreater(res["extracted_text_length"], 0)

    def test_03_chunk_generation(self):
        """Verify PDF processing generates chunks."""
        pdf_bytes = self._make_text_pdf()
        files = {"file": ("chunked_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertGreaterEqual(res["chunks_indexed"], 1)
        if res.get("db_chunks_stored") is not None:
            self.assertGreaterEqual(res["db_chunks_stored"], 1)

    def test_04_postgresql_insertion(self):
        """Verify document_id and rag_document_id are returned (indicating DB insertion)."""
        pdf_bytes = self._make_text_pdf()
        files = {"file": ("db_insert_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
            "visit_id": self.visit_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("document_id", res)
        self.assertTrue(len(res["document_id"]) > 0)
        if res.get("rag_document_id"):
            self.assertTrue(len(res["rag_document_id"]) > 0)

    def test_05_retrieval_accuracy(self):
        """Verify uploaded PDF content can be retrieved via chat."""
        # First upload a PDF with specific content
        pdf_bytes = self._make_text_pdf()
        files = {"file": ("retrieval_test.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": "retrieval-test-session",
        }
        self.client.post("/api/v1/ingest/pdf", files=files, data=data)

        # Then ask about the content
        chat_payload = {
            "session_id": "retrieval-test-session",
            "question": "What is the patient's diagnosis and medication?"
        }
        response = self.client.post("/api/v1/chat", json=chat_payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 10)

    def test_06_malformed_pdf_handling(self):
        """Verify malformed/corrupt PDF is handled gracefully (not a 500 crash)."""
        corrupt_bytes = b"This is not a PDF file at all, just random text content."
        files = {"file": ("corrupt.pdf", corrupt_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        # Should either succeed with fallback text or return a handled error, not 500
        self.assertIn(response.status_code, [200, 422])

    def test_07_empty_pdf_handling(self):
        """Verify empty file is rejected properly."""
        files = {"file": ("empty.pdf", b"", "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertIn(response.status_code, [422, 400])

    def test_08_extracted_entities_present(self):
        """Verify medical entity extraction returns structured data."""
        pdf_bytes = self._make_text_pdf()
        files = {"file": ("entity_test.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("extracted_entities", res)
        self.assertIsInstance(res["extracted_entities"], dict)

    def test_09_session_id_optional(self):
        """Verify PDF upload works without explicit session_id (uses patient_id as fallback)."""
        pdf_bytes = self._make_minimal_pdf()
        files = {"file": ("no_session.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_10_generated_dummy_pdf(self):
        """Verify the generated dummy PDF can be ingested successfully."""
        try:
            from dummy_data.generate_dummy_pdf import generate_dummy_pdf
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp_path = tmp.name
            generate_dummy_pdf(tmp_path)
            with open(tmp_path, "rb") as f:
                pdf_bytes = f.read()
            os.unlink(tmp_path)

            files = {"file": ("sample_medical_report.pdf", pdf_bytes, "application/pdf")}
            data = {
                "patient_id": self.patient_id,
                "session_id": "dummy-pdf-test-session",
            }
            response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
            self.assertEqual(response.status_code, 200)
            res = response.json()
            self.assertEqual(res["status"], "success")
            self.assertGreater(res["extracted_text_length"], 100)
        except ImportError:
            self.skipTest("reportlab not installed, skipping dummy PDF test")


if __name__ == "__main__":
    unittest.main()
