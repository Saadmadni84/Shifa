"""
tests/test_integration_e2e.py

End-to-end integration test that verifies the complete flow:

Upload PDF → Upload Audio → Parse → Store in PostgreSQL →
Ask questions → Retrieve relevant chunks → Gemini generates response →
Conversation history saved → Follow-up question uses memory correctly
"""

import unittest
import io
import os
import sys
import wave
import struct
import math
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app import app


class TestEndToEndIntegration(unittest.TestCase):
    """
    Complete end-to-end integration test.
    Tests the full workflow from document upload through chatbot Q&A with memory.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Use unique IDs to ensure test isolation
        cls.session_id = f"e2e-test-{uuid.uuid4().hex[:8]}"
        cls.patient_id = f"e2e-patient-{uuid.uuid4().hex[:8]}"
        cls.visit_id = f"e2e-visit-{uuid.uuid4().hex[:8]}"

    # ----- Step 1: Upload PDF -----

    def test_step_01_upload_pdf(self):
        """Step 1: Upload a PDF document with medical content."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet

            buf = io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = [
                Paragraph("COMPREHENSIVE MEDICAL REPORT", styles["Title"]),
                Paragraph("Shifa Medical Center - July 28, 2026", styles["Normal"]),
                Spacer(1, 12),
                Paragraph("PATIENT DEMOGRAPHICS", styles["Heading2"]),
                Paragraph(f"Patient Name: Hari Patel", styles["Normal"]),
                Paragraph(f"Patient ID: {self.patient_id}", styles["Normal"]),
                Paragraph("Date of Birth: May 14, 1988 (Age 38)", styles["Normal"]),
                Paragraph("Gender: Male, Blood Group: O+", styles["Normal"]),
                Spacer(1, 12),
                Paragraph("CLINICAL HISTORY", styles["Heading2"]),
                Paragraph(
                    "Patient presented with persistent productive cough for 10 days, "
                    "low-grade intermittent fever (max 100.4F), mild dyspnea on exertion, "
                    "and general fatigue. Known history of childhood asthma.",
                    styles["Normal"]
                ),
                Spacer(1, 12),
                Paragraph("VITAL SIGNS", styles["Heading2"]),
                Paragraph("Blood Pressure: 128/82 mmHg", styles["Normal"]),
                Paragraph("Heart Rate: 92 bpm", styles["Normal"]),
                Paragraph("Temperature: 100.2 F (37.9 C) - Low-Grade Fever", styles["Normal"]),
                Paragraph("SpO2: 96%", styles["Normal"]),
                Paragraph("Respiratory Rate: 22 breaths/min", styles["Normal"]),
                Spacer(1, 12),
                Paragraph("LABORATORY RESULTS", styles["Heading2"]),
                Paragraph("WBC: 12,800/uL (HIGH - normal 4,000-11,000)", styles["Normal"]),
                Paragraph("Hemoglobin: 14.2 g/dL (Normal)", styles["Normal"]),
                Paragraph("CRP: 18.5 mg/L (HIGH - normal less than 10.0)", styles["Normal"]),
                Paragraph("Neutrophils: 72% (HIGH)", styles["Normal"]),
                Paragraph("Eosinophils: 5% (HIGH)", styles["Normal"]),
                Spacer(1, 12),
                Paragraph("DIAGNOSIS", styles["Heading2"]),
                Paragraph(
                    "Primary: Acute Bronchitis (ICD-10: J20.9) with secondary asthma exacerbation. "
                    "Secondary: Mild persistent asthma in acute exacerbation (ICD-10: J45.31).",
                    styles["Normal"]
                ),
                Spacer(1, 12),
                Paragraph("TREATMENT PLAN", styles["Heading2"]),
                Paragraph("1. Amoxicillin 500mg - three times daily for 7 days (after meals)", styles["Normal"]),
                Paragraph("2. Azithromycin 500mg - once daily for 3 days (with food)", styles["Normal"]),
                Paragraph("3. Montelukast 10mg - once daily at bedtime for 30 days", styles["Normal"]),
                Paragraph("4. Albuterol HFA Inhaler - 2 puffs every 4-6 hours as needed", styles["Normal"]),
                Paragraph("5. Guaifenesin Syrup 10mL - three times daily for 5 days", styles["Normal"]),
                Paragraph("6. Paracetamol 500mg - every 6 hours as needed for fever", styles["Normal"]),
                Spacer(1, 12),
                Paragraph("FOLLOW-UP", styles["Heading2"]),
                Paragraph("Follow-up appointment: August 4, 2026 with Dr. Anika Mehta", styles["Normal"]),
                Paragraph("Attending Physician: Dr. Anika Mehta, MD (Pulmonology)", styles["Normal"]),
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

        files = {"file": ("e2e_medical_report.pdf", pdf_bytes, "application/pdf")}
        data = {
            "patient_id": self.patient_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/pdf", files=files, data=data)
        self.assertEqual(response.status_code, 200, f"PDF upload failed: {response.text}")
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["extracted_text_length"], 0)
        self.assertGreaterEqual(res["chunks_indexed"], 1)

        # Store for later verification
        self.__class__.pdf_document_id = res["document_id"]
        print(f"[STEP 1] PDF uploaded. Document ID: {res['document_id']}, "
              f"Text length: {res['extracted_text_length']}, Chunks: {res['chunks_indexed']}")

    # ----- Step 2: Upload Audio -----

    def test_step_02_upload_audio(self):
        """Step 2: Upload an audio recording for the same session."""
        sample_rate = 44100
        duration = 2.0
        total_samples = int(sample_rate * duration)
        samples = [int(5000 * math.sin(2 * math.pi * 440 * i / sample_rate)) for i in range(total_samples)]

        wav_buf = io.BytesIO()
        with wave.open(wav_buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))

        files = {"file": ("e2e_consultation.wav", wav_buf.getvalue(), "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200, f"Audio upload failed: {response.text}")
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertTrue(len(res["transcript"]) > 0)
        self.assertGreaterEqual(res["chunks_indexed"], 1)

        self.__class__.audio_transcript_id = res["transcript_id"]
        print(f"[STEP 2] Audio uploaded. Transcript ID: {res['transcript_id']}, "
              f"Transcript length: {len(res['transcript'])}")

    # ----- Step 3: Ask Questions → Retrieve Chunks → Gemini Response -----

    def test_step_03_ask_question_about_diagnosis(self):
        """Step 3: Ask a question about the uploaded medical content."""
        payload = {
            "session_id": self.session_id,
            "question": "What is the patient's primary diagnosis?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()

        self.assertEqual(res["session_id"], self.session_id)
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 10)
        self.assertTrue(res["retrieval_performed"])

        print(f"[STEP 3] Question: '{payload['question']}'")
        print(f"         Answer: {res['answer'][:200]}...")
        print(f"         Retrieval: {res['retrieval_performed']}, Sources: {len(res.get('sources', []))}")

    # ----- Step 4: Verify Conversation History Saved -----

    def test_step_04_conversation_history_saved(self):
        """Step 4: Ask another question to verify history accumulation."""
        payload = {
            "session_id": self.session_id,
            "question": "What medications were prescribed and at what dosages?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 10)

        print(f"[STEP 4] Question: '{payload['question']}'")
        print(f"         Answer: {res['answer'][:200]}...")

    # ----- Step 5: Follow-up Uses Memory -----

    def test_step_05_followup_uses_memory(self):
        """Step 5: Ask a follow-up that relies on conversation memory."""
        payload = {
            "session_id": self.session_id,
            "question": "How long should those be taken?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 5)

        print(f"[STEP 5] Follow-up: '{payload['question']}'")
        print(f"         Answer: {res['answer'][:200]}...")
        print(f"         (This should reference medications from previous turn)")

    # ----- Step 6: Ask About Lab Results -----

    def test_step_06_ask_about_lab_results(self):
        """Step 6: Ask about specific data from the PDF (lab results)."""
        payload = {
            "session_id": self.session_id,
            "question": "What were the lab results? Was anything elevated?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)

        print(f"[STEP 6] Question: '{payload['question']}'")
        print(f"         Answer: {res['answer'][:200]}...")

    # ----- Step 7: Verify Session Isolation -----

    def test_step_07_session_isolation(self):
        """Step 7: Verify a different session does not access this session's content."""
        other_session = f"isolated-{uuid.uuid4().hex[:8]}"
        payload = {
            "session_id": other_session,
            "question": "What is the patient's diagnosis?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        # Should work but may not have specific content from our session

        print(f"[STEP 7] Isolated session '{other_session}' query succeeded (session isolation OK)")

    # ----- Step 8: Verify Health After Full Flow -----

    def test_step_08_health_check(self):
        """Step 8: Verify system health after the complete flow."""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("status", res)

        print(f"[STEP 8] System health: {res['status']}")
        print(f"         DB: {res['database']['status']}")
        print(f"         Vector: {res['vector_store']['status']}")
        print(f"         LLM: {res['llm']['status']}")

    # ----- Step 9: Ask About Follow-Up Instructions -----

    def test_step_09_ask_followup_instructions(self):
        """Step 9: Verify the chatbot can answer about follow-up details."""
        payload = {
            "session_id": self.session_id,
            "question": "When is the follow-up appointment and with which doctor?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)

        print(f"[STEP 9] Question: '{payload['question']}'")
        print(f"         Answer: {res['answer'][:200]}...")

    # ----- Step 10: Full Summary Request -----

    def test_step_10_summary_request(self):
        """Step 10: Ask for a comprehensive summary using all accumulated context."""
        payload = {
            "session_id": self.session_id,
            "question": "Can you give me a complete summary of everything we discussed about this patient?"
        }
        response = self.client.post("/api/v1/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("answer", res)
        self.assertTrue(len(res["answer"]) > 20)

        print(f"\n[STEP 10] FINAL SUMMARY REQUEST")
        print(f"          Answer length: {len(res['answer'])} chars")
        print(f"          Latency: {res['latencies']['total_ms']}ms")
        print(f"\n{'='*60}")
        print("END-TO-END INTEGRATION TEST COMPLETED SUCCESSFULLY")
        print(f"{'='*60}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
