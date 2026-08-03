"""
dto/schemas.py

Pydantic DTO schemas for API request validation and response models.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# Chat Schemas
# ==========================================

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="UUID of active chat session")
    question: str = Field(..., min_length=1, description="User question or prompt")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "session_id": "123e4567-e89b-12d3-a456-426614174000",
            "question": "What medicines were prescribed during my last visit?"
        }
    })


class LatencyMetrics(BaseModel):
    intent_classification_ms: float = 0.0
    retrieval_ms: float = 0.0
    prompt_building_ms: float = 0.0
    generation_ms: float = 0.0
    total_ms: float = 0.0


class DocumentSource(BaseModel):
    document_type: Optional[str] = "medical_record"
    content_snippet: str
    metadata: Dict[str, Any]


class ChatResponse(BaseModel):
    session_id: str
    question: str
    answer: str
    retrieval_performed: bool
    sources: List[DocumentSource] = []
    latencies: LatencyMetrics


# ==========================================
# Health Check Schemas
# ==========================================

class ComponentHealth(BaseModel):
    status: str
    details: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    database: ComponentHealth
    vector_store: ComponentHealth
    llm: ComponentHealth
    timestamp: str


# ==========================================
# Vector Index Management Schemas
# ==========================================

class IndexPatientRequest(BaseModel):
    patient_id: str = Field(..., description="UUID of patient to index")


class IndexResponse(BaseModel):
    status: str
    patient_id: str
    documents_indexed: int
    chunks_indexed: int
    collection_size: int
    message: str


class CollectionStatsResponse(BaseModel):
    collection_name: str
    total_vectors: int


# ==========================================
# Document Ingestion Schemas
# ==========================================

class IngestPDFResponse(BaseModel):
    status: str
    document_id: str
    rag_document_id: Optional[str] = None
    patient_id: str
    document_type: Optional[str] = "General Medical Report"
    extracted_text_length: int
    ocr_applied: bool
    chunks_indexed: int
    db_chunks_stored: Optional[int] = None
    pages_processed: Optional[int] = None
    extracted_entities: Dict[str, Any]


class IngestAudioResponse(BaseModel):
    status: str
    transcript_id: str
    rag_document_id: Optional[str] = None
    patient_id: str
    visit_id: str
    transcript: str
    chunks_indexed: int
    db_chunks_stored: Optional[int] = None
    extracted_entities: Dict[str, Any]


# ==========================================
# Error Response Schema
# ==========================================

class ErrorResponse(BaseModel):
    error: str
    code: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
