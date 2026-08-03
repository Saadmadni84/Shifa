"""
db/medical_repository.py

Repository for saving structured medical entities extracted from PDF documents and Audio recordings.
"""

from typing import List, Dict, Any, Optional
from uuid import uuid4
from db.postgres import execute_query, execute_single_query, execute_non_query, get_db_transaction
from common.logging import logger


class MedicalRepository:
    """Handles persistence of structured medical records in PostgreSQL."""

    def check_duplicate_document(self, file_hash: str) -> Optional[Dict[str, Any]]:
        """Check if a document with the same hash already exists."""
        query = """
        SELECT id, patient_id, document_type, created_at
        FROM uploaded_documents
        WHERE file_hash = %s AND deleted = FALSE;
        """
        return execute_single_query(query, (file_hash,))

    def save_uploaded_document(
        self,
        patient_id: str,
        visit_id: Optional[str],
        file_name: str,
        file_path: str,
        document_type: str,
        file_hash: Optional[str] = None,
        file_size_bytes: Optional[int] = None,
        description: Optional[str] = None
    ) -> str:
        """Saves uploaded document record and returns generated UUID."""
        doc_id = str(uuid4())
        query = """
        INSERT INTO uploaded_documents (
            id,
            patient_id,
            visit_id,
            original_filename,
            file_path,
            document_type,
            file_hash,
            file_size_bytes,
            description,
            created_at,
            deleted
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), FALSE);
        """
        success = execute_non_query(
            query,
            (doc_id, patient_id, visit_id, file_name, file_path, document_type, file_hash, file_size_bytes, description)
        )
        if not success:
            logger.warning("Failed to insert uploaded_documents record (DB may be offline). Continuing with in-memory ID.")
        return doc_id

    def save_ocr_result(self, document_id: str, page_number: int, raw_text: str) -> bool:
        """Saves OCR text result for a document page."""
        ocr_id = str(uuid4())
        query = """
        INSERT INTO ocr_results (
            id,
            document_id,
            page_number,
            raw_text,
            created_at
        ) VALUES (%s, %s, %s, %s, NOW());
        """
        return execute_non_query(query, (ocr_id, document_id, page_number, raw_text))

    def save_transcript(
        self,
        visit_id: str,
        transcript_text: str,
        audio_url: Optional[str] = None,
        speaker_labels: Optional[str] = None
    ) -> str:
        """Saves audio transcription record."""
        transcript_id = str(uuid4())
        query = """
        INSERT INTO transcripts (
            id,
            visit_id,
            audio_url,
            transcript_text,
            speaker_labels,
            created_at
        ) VALUES (%s, %s, %s, %s, %s, NOW());
        """
        execute_non_query(
            query,
            (transcript_id, visit_id, audio_url, transcript_text, speaker_labels)
        )
        return transcript_id

    def update_visit_medical_data(
        self,
        visit_id: str,
        chief_complaint: Optional[str] = None,
        diagnosis: Optional[str] = None,
        raw_notes: Optional[str] = None
    ) -> bool:
        """Updates visit clinical details."""
        query = """
        UPDATE visits
        SET
            chief_complaint = COALESCE(%s, chief_complaint),
            diagnosis = COALESCE(%s, diagnosis),
            raw_notes = COALESCE(%s, raw_notes),
            updated_at = NOW()
        WHERE id = %s AND deleted = FALSE;
        """
        return execute_non_query(query, (chief_complaint, diagnosis, raw_notes, visit_id))

    def save_extracted_medications(
        self,
        prescription_id: str,
        medications: List[Dict[str, Any]]
    ) -> bool:
        """Saves extracted medications list under a prescription."""
        if not medications:
            return True

        query = """
        INSERT INTO medications (
            id,
            prescription_id,
            name,
            generic_name,
            dosage,
            frequency,
            timing,
            duration_days,
            instructions,
            sort_order,
            created_at,
            deleted
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), FALSE);
        """
        try:
            with get_db_transaction() as (_, cursor):
                for idx, med in enumerate(medications, 1):
                    med_id = str(uuid4())
                    cursor.execute(
                        query,
                        (
                            med_id,
                            prescription_id,
                            med.get("name"),
                            med.get("generic_name"),
                            med.get("dosage"),
                            med.get("frequency"),
                            med.get("timing"),
                            med.get("duration_days"),
                            med.get("instructions"),
                            idx
                        )
                    )
            return True
        except Exception as e:
            logger.error(f"Failed to save extracted medications: {e}")
            return False

    def save_vital_signs(
        self,
        visit_id: str,
        blood_pressure: Optional[str] = None,
        heart_rate: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> bool:
        """Saves extracted vital signs for a visit."""
        vital_id = str(uuid4())
        query = """
        INSERT INTO vital_signs (
            id,
            visit_id,
            blood_pressure,
            heart_rate,
            temperature,
            recorded_at
        ) VALUES (%s, %s, %s, %s, %s, NOW());
        """
        return execute_non_query(
            query,
            (vital_id, visit_id, blood_pressure, heart_rate, temperature)
        )
