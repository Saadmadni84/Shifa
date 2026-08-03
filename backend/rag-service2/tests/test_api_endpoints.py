"""
tests/test_api_endpoints.py

Comprehensive unittest suite for FastAPI backend endpoints (Task 4, 5, 6, 8, 14).
"""

import unittest
import io
import wave
import struct
from fastapi.testclient import TestClient
from app import app


class TestBackendAPIEndpoints(unittest.TestCase):
    """Test suite covering Health, Index Stats, Chat turn, PDF upload, and Audio upload APIs."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.patient_id = "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"
        cls.visit_id = "demo-visit-001"

    def test_01_health_endpoint(self):
        """Verify GET /api/v1/health returns status 200 and component metrics."""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("vector_store", data)
        self.assertIn("llm", data)

    def test_02_index_stats_endpoint(self):
        """Verify GET /api/v1/index/stats returns collection stats."""
        response = self.client.get("/api/v1/index/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("collection_name", data)
        self.assertIn("total_vectors", data)

    def test_03_chat_greeting(self):
        """Verify chit-chat greeting skips vector search."""
        payload = {
            "session_id": "unittest-session-001",
            "question": "Hello Shifa AI"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["session_id"], "unittest-session-001")
        self.assertFalse(data["retrieval_performed"])

    def test_04_chat_medical_query(self):
        """Verify medical question performs retrieval and generates answer."""
        payload = {
            "session_id": "unittest-session-001",
            "question": "What is Hari Patel's diagnosis and prescribed medication?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["retrieval_performed"])
        self.assertIn("answer", data)
        self.assertTrue(len(data["answer"]) > 10)

    def test_05_pdf_ingestion(self):
        """Verify PDF upload endpoint extracts, processes, and indexes document."""
        sample_pdf = (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n"
            b"0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
        )
        files = {"file": ("test_report.pdf", sample_pdf, "application/pdf")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["patient_id"], self.patient_id)

    def test_06_audio_ingestion(self):
        """Verify Audio upload endpoint transcribes and indexes recording."""
        wav_buf = io.BytesIO()
        with wave.open(wav_buf, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(44100)
            samples = [int(1000 * (i % 10)) for i in range(44100)]
            wav_file.writeframes(struct.pack(f'<{len(samples)}h', *samples))

        files = {"file": ("recording.wav", wav_buf.getvalue(), "audio/wav")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertIn("transcript", res)


if __name__ == "__main__":
    unittest.main()
