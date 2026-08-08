"""
app.py

Production-ready FastAPI Web Service for Shifa Medical RAG Backend.

Endpoints
---------
1. POST   /api/v1/chat                      - Chatbot conversation turn
2. GET    /api/v1/health                    - Complete component health check
3. POST   /api/v1/index/patient/{patient_id} - Trigger patient vector indexing
4. DELETE /api/v1/index/patient/{patient_id} - Delete patient vector chunks
5. GET    /api/v1/index/stats               - Vector store collection metrics
6. POST   /api/v1/ingest/pdf                - Upload & process PDF document
7. POST   /api/v1/ingest/audio              - Upload & process Audio recording
"""

import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import FastAPI, Request, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dto.schemas import (
    ChatRequest,
    ChatResponse,
    HealthResponse,
    ComponentHealth,
    IndexResponse,
    CollectionStatsResponse,
    IngestPDFResponse,
    IngestAudioResponse,
    ErrorResponse
)

from services.chat_service import ChatService
from services.indexer import Indexer
from ingestion.pdf import PDFProcessor
from ingestion.audio import AudioProcessor
from db.postgres import execute_single_query
from services.embedder import VectorStore
from services.generator import Generator
from common.exceptions import ShifaException
from common.logging import logger

app = FastAPI(
    title="Shifa Medical RAG Backend API",
    description="Production-Ready Medical RAG, Conversation Memory, PDF OCR, Audio Processing, and Vector Search Service.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend Integration (Task 14)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Service Instances (Singletons)
chat_service = ChatService()
indexer = Indexer()
pdf_processor = PDFProcessor()
audio_processor = AudioProcessor()
vector_store = VectorStore()
generator = Generator()


# =========================================================
# Middleware: Request Timing & Logging
# =========================================================

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f"{process_time_ms}ms"
    logger.info(f"[{request.method}] {request.url.path} completed in {process_time_ms}ms (Status {response.status_code})")
    return response


# =========================================================
# Custom Exception Handlers (Task 11)
# =========================================================

@app.exception_handler(ShifaException)
async def shifa_exception_handler(request: Request, exc: ShifaException):
    logger.error(f"[EXCEPTION] {exc.error_code}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.message,
            code=exc.error_code,
            detail=str(exc.details) if exc.details else None
        ).model_dump()
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"[UNHANDLED_EXCEPTION] {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="An unexpected internal server error occurred.",
            code="INTERNAL_SERVER_ERROR",
            detail=str(exc)
        ).model_dump()
    )


# =========================================================
# Health Endpoint (Task 4)
# =========================================================

@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Returns complete system health status across DB, ChromaDB, and Gemini LLM."""
    # Check PostgreSQL
    db_health = ComponentHealth(status="healthy")
    try:
        res = execute_single_query("SELECT 1 AS alive;")
        if not res or res.get("alive") != 1:
            db_health = ComponentHealth(status="unhealthy", details="Query failed")
    except Exception as e:
        db_health = ComponentHealth(status="unhealthy", details=str(e))

    # Check Vector Store
    v_health = ComponentHealth(status="healthy")
    try:
        count = vector_store.count()
        v_health.details = f"Collection size: {count} vectors"
    except Exception as e:
        v_health = ComponentHealth(status="unhealthy", details=str(e))

    # Check LLM Client
    llm_health = ComponentHealth(status="healthy")
    if not generator.client:
        llm_health = ComponentHealth(status="unhealthy", details="GEMINI_API_KEY missing")

    overall = "healthy" if (db_health.status == "healthy" and v_health.status == "healthy" and llm_health.status == "healthy") else "degraded"

    return HealthResponse(
        status=overall,
        database=db_health,
        vector_store=v_health,
        llm=llm_health,
        timestamp=datetime.now(timezone.utc).isoformat()
    )


# =========================================================
# Chat Endpoint (Task 1, 2, 3, 4, 14)
# =========================================================

@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Chatbot"])
async def chat_endpoint(request: ChatRequest):
    """
    Main chatbot conversation turn endpoint.
    Handles user question, memory formatting, intelligent retrieval, and Gemini response.
    """
    result = chat_service.chat(
        session_id=request.session_id,
        question=request.question
    )
    return ChatResponse(**result)


# =========================================================
# Vector Index Management Endpoints (Task 8)
# =========================================================

@app.post("/api/v1/index/patient/{patient_id}", response_model=IndexResponse, tags=["Vector Index"])
async def index_patient_endpoint(patient_id: str):
    """Triggers indexing/re-indexing of all medical records for a given patient."""
    result = indexer.reindex_patient(patient_id)
    return IndexResponse(
        status=result["status"],
        patient_id=patient_id,
        documents_indexed=result["documents_indexed"],
        chunks_indexed=result["chunks_indexed"],
        collection_size=result["collection_size"],
        message=f"Indexed patient '{patient_id}' successfully."
    )


@app.delete("/api/v1/index/patient/{patient_id}", tags=["Vector Index"])
async def delete_patient_index_endpoint(patient_id: str):
    """Deletes all vector chunks belonging to a patient from ChromaDB."""
    return indexer.delete_patient(patient_id)


@app.get("/api/v1/index/stats", response_model=CollectionStatsResponse, tags=["Vector Index"])
async def index_stats_endpoint():
    """Returns vector store collection metrics."""
    return CollectionStatsResponse(**indexer.collection_stats())


# =========================================================
# Document Ingestion Endpoints (Task 5 & 6)
# =========================================================

@app.post("/api/v1/ingest/pdf", response_model=IngestPDFResponse, tags=["Document Ingestion"])
async def ingest_pdf_endpoint(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    session_id: Optional[str] = Form(None),
    visit_id: Optional[str] = Form(None)
):
    """
    Uploads, parses, extracts text, chunks, saves to PostgreSQL,
    and indexes a PDF document into ChromaDB.
    The original PDF is NOT stored.
    """
    file_bytes = await file.read()
    result = pdf_processor.process_pdf(
        file_bytes=file_bytes,
        file_name=file.filename or "uploaded_document.pdf",
        patient_id=patient_id,
        session_id=session_id,
        visit_id=visit_id
    )
    return IngestPDFResponse(**result)


@app.post("/api/v1/ingest/audio", response_model=IngestAudioResponse, tags=["Audio Ingestion"])
async def ingest_audio_endpoint(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    visit_id: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """
    Uploads, transcribes, chunks, saves to PostgreSQL,
    and indexes an Audio recording into ChromaDB.
    The original audio file is NOT stored.
    """
    file_bytes = await file.read()
    result = audio_processor.process_audio(
        file_bytes=file_bytes,
        file_name=file.filename or "uploaded_audio.wav",
        patient_id=patient_id,
        visit_id=visit_id,
        session_id=session_id,
        mime_type=file.content_type or "audio/wav"
    )
    return IngestAudioResponse(**result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
