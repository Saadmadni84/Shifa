"""
common/exceptions.py

Custom exception hierarchy for the Shifa Medical RAG System.
Provides clean exception mapping for FastAPI HTTP handlers.
"""

from typing import Optional, Any, Dict


class ShifaException(Exception):
    """Base exception for all domain errors in Shifa Medical RAG."""

    status_code: int = 500
    error_code: str = "INTERNAL_SERVER_ERROR"

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class InvalidSessionError(ShifaException):
    """Raised when a chat session ID does not exist or is inactive."""
    status_code = 404
    error_code = "INVALID_SESSION"


class InvalidPatientError(ShifaException):
    """Raised when a patient ID is invalid or deleted."""
    status_code = 404
    error_code = "INVALID_PATIENT"


class PDFProcessingError(ShifaException):
    """Raised when parsing or ingesting a PDF document fails."""
    status_code = 422
    error_code = "PDF_PROCESSING_ERROR"


class AudioProcessingError(ShifaException):
    """Raised when audio decoding or processing fails."""
    status_code = 422
    error_code = "AUDIO_PROCESSING_ERROR"


class OCRFailureError(ShifaException):
    """Raised when OCR extraction fails on a document."""
    status_code = 500
    error_code = "OCR_FAILURE"


class SpeechRecognitionError(ShifaException):
    """Raised when speech recognition or transcription fails."""
    status_code = 500
    error_code = "SPEECH_RECOGNITION_FAILURE"


class VectorDBError(ShifaException):
    """Raised when ChromaDB vector index operations fail."""
    status_code = 500
    error_code = "VECTOR_DB_ERROR"


class LLMGenerationError(ShifaException):
    """Raised when Gemini LLM generation fails or returns empty output."""
    status_code = 500
    error_code = "LLM_GENERATION_FAILURE"


class DatabaseError(ShifaException):
    """Raised when PostgreSQL queries or connection pools fail."""
    status_code = 500
    error_code = "DATABASE_ERROR"
