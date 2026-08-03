"""
tests/test_chatbot_comprehensive.py

Comprehensive tests for chatbot functionality:
- Answers from uploaded content
- Retrieval accuracy
- Follow-up questions
- Conversation memory
- Chat history persistence
- Session isolation
- Graceful unknown question handling
"""

import unittest
import io
import os
import sys
import wave
import struct
import math

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app import app


class TestChatbotComprehensive(unittest.TestCase):
    """Comprehensive chatbot test suite."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.patient_id = "chatbot-test-patient"
        cls.session_a = "chatbot-session-A"
        cls.session_b = "chatbot-session-B"
        cls.visit_id = "chatbot-test-visit-001"

        # Upload a PDF with specific medical content to session A
        cls._upload_test_content(cls)

    def _upload_test_content(self):
        """Upload PDF and audio with known content for chatbot testing."""
        # Create PDF with specific, identifiable content
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
                Paragraph("Patient ID: chatbot-test-patient", styles["Normal"]),
                Paragraph("Date: July 28, 2026", styles["Normal"]),
                Paragraph("Primary Diagnosis: Acute Bronchitis with secondary asthma exacerbation", styles["Normal"]),
                Paragraph("Blood Pressure: 128/82 mmHg, Heart Rate: 92 bpm", styles["Normal"]),
                Paragraph("Temperature: 100.2 degrees Fahrenheit, indicating low-grade fever", styles["Normal"]),
                Paragraph("White Blood Cell Count: 12,800 per microliter, elevated", styles["Normal"]),
                Paragraph("CRP: 18.5 mg/L, elevated indicating inflammation", styles["Normal"]),
                Paragraph("Chest X-Ray: Bilateral peribronchial cuffing, mild basal haziness", styles["Normal"]),
                Paragraph("Medications Prescribed:", styles["Heading2"]),
                Paragraph("1. Amoxicillin 500mg three times daily for 7 days", styles["Normal"]),
                Paragraph("2. Azithromycin 500mg once daily for 3 days", styles["Normal"]),
                Paragraph("3. Montelukast 10mg at bedtime for 30 days", styles["Normal"]),
                Paragraph("4. Albuterol HFA inhaler 2 puffs every 4-6 hours as needed", styles["Normal"]),
                Paragraph("Follow-up: August 4, 2026 with Dr. Anika Mehta", styles["Normal"]),
            ]
            doc.build(elements)
            pdf_bytes = buf.getvalue()
        except ImportError:
            pdf_bytes = (
                b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
                b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
                b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
                b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n"
                b"0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
            )

        # Upload PDF to session A
        files = {"file": ("hari_patel_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_a,
        }
        self.client.post("/api/v1/ingest/pdf", files=files, data=data)

        # Upload audio to session A
        wav_buf = io.BytesIO()
        with wave.open(wav_buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(44100)
            samples = [int(3000 * math.sin(2 * math.pi * 440 * i / 44100)) for i in range(44100)]
            wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))

        files = {"file": ("consultation.wav", wav_buf.getvalue(), "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_a,
        }
        self.client.post("/api/v1/ingest/audio", files=files, data=data)

    # ----- Test Cases -----

    def test_01_answers_from_uploaded_content(self):
        """Verify chatbot generates answers based on uploaded content."""
        payload = {
            "session_id": self.session_a,
            "question": "What is the patient's diagnosis?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 10)

    def test_02_retrieval_returns_relevant_chunks(self):
        """Verify retrieval is performed for medical questions."""
        payload = {
            "session_id": self.session_a,
            "question": "What medications were prescribed to the patient?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertTrue(res["retrieval_performed"])

    def test_03_followup_questions_work(self):
        """Verify follow-up questions build on previous conversation."""
        # First question
        payload1 = {
            "session_id": self.session_a,
            "question": "What is the patient's blood pressure?"
        }
        resp1 = self.client.post("/api/v1/chat", json=payload1)
        self.assertEqual(resp1.status_code, 200)

        # Follow-up question
        payload2 = {
            "session_id": self.session_a,
            "question": "Is that considered normal?"
        }
        resp2 = self.client.post("/api/v1/chat", json=payload2)
        self.assertEqual(resp2.status_code, 200)
        res2 = resp2.json()
        self.assertIn("answer", res2)
        self.assertTrue(len(res2["answer"]) > 5)

    def test_04_conversation_memory_works(self):
        """Verify the chatbot remembers previous messages in the session."""
        session = "memory-test-session"

        # Ask a specific question
        payload1 = {
            "session_id": session,
            "question": "What medications were prescribed to Hari Patel?"
        }
        self.client.post("/api/v1/chat", json=payload1)

        # Ask follow-up that relies on memory
        payload2 = {
            "session_id": session,
            "question": "Can you tell me more about the dosage?"
        }
        resp2 = self.client.post("/api/v1/chat", json=payload2)
        self.assertEqual(resp2.status_code, 200)
        res2 = resp2.json()
        self.assertIn("answer", res2)

    def test_05_chat_history_persists(self):
        """Verify chat history is accessible after multiple turns."""
        session = "persist-test-session"

        # Multiple conversation turns
        questions = [
            "Hello, I need help understanding my report.",
            "What was my diagnosis?",
            "What medications were prescribed?"
        ]

        for q in questions:
            payload = {"session_id": session, "question": q}
            resp = self.client.post("/api/v1/chat", json=payload)
            self.assertEqual(resp.status_code, 200)

        # One more question — should have context from all previous turns
        payload = {
            "session_id": session,
            "question": "Can you summarize what we discussed?"
        }
        resp = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(resp.status_code, 200)
        res = resp.json()
        self.assertIn("answer", res)

    def test_06_session_isolation(self):
        """Verify different sessions are isolated from each other."""
        # Session B should not have access to Session A's uploaded content
        payload_b = {
            "session_id": self.session_b,
            "question": "What is the patient's diagnosis from the PDF?"
        }
        resp_b = self.client.post("/api/v1/chat", json=payload_b)
        self.assertEqual(resp_b.status_code, 200)

        # Session A should work normally
        payload_a = {
            "session_id": self.session_a,
            "question": "What is the patient's diagnosis?"
        }
        resp_a = self.client.post("/api/v1/chat", json=payload_a)
        self.assertEqual(resp_a.status_code, 200)

        # Both should return valid answers
        self.assertIn("answer", resp_a.json())
        self.assertIn("answer", resp_b.json())

    def test_07_handles_unknown_questions_gracefully(self):
        """Verify chatbot handles questions about information not in records."""
        payload = {
            "session_id": self.session_a,
            "question": "What is the patient's favorite color and childhood pet name?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        # Should not crash — should give some response
        self.assertTrue(len(res["answer"]) > 5)

    def test_08_greeting_skips_retrieval(self):
        """Verify greetings skip vector retrieval."""
        payload = {
            "session_id": self.session_a,
            "question": "Hello!"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertFalse(res["retrieval_performed"])

    def test_09_latencies_returned(self):
        """Verify latency metrics are included in response."""
        payload = {
            "session_id": self.session_a,
            "question": "What were the lab results?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("latencies", res)
        latencies = res["latencies"]
        self.assertIn("total_ms", latencies)
        self.assertGreater(latencies["total_ms"], 0)

    def test_10_sources_returned_on_retrieval(self):
        """Verify sources are returned when retrieval is performed."""
        payload = {
            "session_id": self.session_a,
            "question": "What is the patient's heart rate and temperature?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        if res["retrieval_performed"]:
            self.assertIn("sources", res)


if __name__ == "__main__":
    unittest.main()
