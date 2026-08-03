"""
services/extractor.py

Medical information extraction service (Task 7).
Uses Gemini to extract structured entities from raw text/OCR/audio transcripts.
"""

import json
from typing import Dict, Any, Optional
from services.generator import Generator
from common.logging import logger


class MedicalInformationExtractor:
    """Extracts structured medical entities (diagnoses, medications, vitals) from clinical text."""

    EXTRACTION_PROMPT_TEMPLATE = """You are a clinical NLP extractor. Analyze the clinical text below and extract all medical information into a valid JSON object matching the exact structure specified.

JSON STRUCTURE REQUIRED:
{{
  "document_type": "Lab Report" | "Prescription" | "Discharge Summary" | "Radiology Report" | "General Medical Report",
  "visit_date": "YYYY-MM-DD" or null,
  "chief_complaint": "Extracted main complaint/symptoms" or null,
  "diagnosis": "Extracted diagnosis" or null,
  "vital_signs": {{
    "blood_pressure": "120/80" or null,
    "heart_rate": 72 or null,
    "temperature": 98.6 or null
  }},
  "medications": [
    {{
      "name": "Medication Name",
      "generic_name": "Generic Name or null",
      "dosage": "500 mg",
      "frequency": "Twice daily",
      "timing": "After meals",
      "duration_days": 5,
      "instructions": "Special instructions or null"
    }}
  ],
  "doctor_notes": "Clinical summary/notes" or null,
  "recommendations": "Advice or follow up instructions" or null
}}

CLINICAL TEXT TO ANALYZE:
{text}

OUTPUT ONLY VALID JSON:
"""

    def __init__(self, generator: Optional[Generator] = None):
        self.generator = generator or Generator()

    def extract(self, raw_text: str) -> Dict[str, Any]:
        """
        Extracts structured medical entities from text.
        """
        if not raw_text or not raw_text.strip():
            return {
                "document_type": "General Medical Report",
                "visit_date": None,
                "chief_complaint": None,
                "diagnosis": None,
                "vital_signs": {},
                "medications": [],
                "doctor_notes": None,
                "recommendations": None
            }

        prompt = self.EXTRACTION_PROMPT_TEMPLATE.format(text=raw_text[:4000])

        try:
            raw_response = self.generator.generate(prompt)
            # Clean JSON formatting wrappers if present
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            logger.info(f"[EXTRACTOR] Extracted structured entity: doc_type='{parsed.get('document_type')}', meds_count={len(parsed.get('medications', []))}")
            return parsed
        except Exception as e:
            logger.error(f"[EXTRACTOR] Failed to parse structured medical JSON: {e}")
            return {
                "document_type": "General Medical Report",
                "visit_date": None,
                "chief_complaint": raw_text[:200],
                "diagnosis": None,
                "vital_signs": {},
                "medications": [],
                "doctor_notes": raw_text[:1000],
                "recommendations": None
            }
