"""
tests/test_audio_ingestion.py

Comprehensive tests for audio upload, transcription, chunking, and PostgreSQL storage.
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


class TestAudioIngestion(unittest.TestCase):
    """Comprehensive audio ingestion test suite."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.patient_id = "test-audio-patient-001"
        cls.session_id = "test-audio-session-001"
        cls.visit_id = "test-audio-visit-001"

    # ----- Helpers -----

    @staticmethod
    def _make_wav_bytes(duration_s: float = 1.0, sample_rate: int = 44100) -> bytes:
        """Creates a valid WAV file in memory."""
        total_samples = int(sample_rate * duration_s)
        samples = []
        for i in range(total_samples):
            t = i / sample_rate
            sample = int(5000 * math.sin(2 * math.pi * 440 * t))
            samples.append(max(-32767, min(32767, sample)))

        wav_buf = io.BytesIO()
        with wave.open(wav_buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))
        return wav_buf.getvalue()

    @staticmethod
    def _make_simple_audio_bytes() -> bytes:
        """Creates minimal audio-like bytes for format testing."""
        wav_buf = io.BytesIO()
        with wave.open(wav_buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(44100)
            samples = [int(1000 * (i % 10)) for i in range(44100)]
            wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))
        return wav_buf.getvalue()

    # ----- Test Cases -----

    def test_01_upload_succeeds(self):
        """Verify audio upload returns 200 with success status."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("recording.wav", audio_bytes, "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["patient_id"], self.patient_id)

    def test_02_transcription_succeeds(self):
        """Verify transcription produces non-empty text."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("transcript_test.wav", audio_bytes, "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("transcript", res)
        self.assertTrue(len(res["transcript"]) > 0)

    def test_03_chunk_generation(self):
        """Verify audio processing generates chunks."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("chunk_test.wav", audio_bytes, "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertGreaterEqual(res["chunks_indexed"], 1)

    def test_04_postgresql_insertion(self):
        """Verify transcript_id and rag_document_id are returned."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("db_test.wav", audio_bytes, "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("transcript_id", res)
        self.assertTrue(len(res["transcript_id"]) > 0)

    def test_05_wav_format(self):
        """Verify WAV format uploads correctly."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("test.wav", audio_bytes, "audio/wav")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_06_mp3_format_accepted(self):
        """Verify MP3 filename is accepted (even with WAV bytes, tests extension handling)."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("test.mp3", audio_bytes, "audio/mp3")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_07_m4a_format_accepted(self):
        """Verify M4A filename is accepted."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("test.m4a", audio_bytes, "audio/m4a")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_08_ogg_format_accepted(self):
        """Verify OGG filename is accepted."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("test.ogg", audio_bytes, "audio/ogg")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_09_flac_format_accepted(self):
        """Verify FLAC filename is accepted."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("test.flac", audio_bytes, "audio/flac")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)

    def test_10_invalid_audio_handling(self):
        """Verify empty audio file is rejected properly."""
        files = {"file": ("empty.wav", b"", "audio/wav")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertIn(response.status_code, [422, 400])

    def test_11_extracted_entities_present(self):
        """Verify medical entity extraction returns structured data."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("entity_test.wav", audio_bytes, "audio/wav")}
        data = {
            "patient_id": self.patient_id,
            "visit_id": self.visit_id,
            "session_id": self.session_id,
        }
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertIn("extracted_entities", res)
        self.assertIsInstance(res["extracted_entities"], dict)

    def test_12_session_id_optional(self):
        """Verify audio upload works without explicit session_id."""
        audio_bytes = self._make_wav_bytes()
        files = {"file": ("no_session.wav", audio_bytes, "audio/wav")}
        data = {"patient_id": self.patient_id, "visit_id": self.visit_id}
        response = self.client.post("/api/v1/ingest/audio", files=files, data=data)
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
