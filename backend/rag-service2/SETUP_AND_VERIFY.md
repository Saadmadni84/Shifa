# Shifa Medical RAG Backend — Setup & Verification Guide

## Overview

This guide covers how to set up, run, and verify the Shifa Medical RAG Backend including:
- PDF upload & parsing
- Audio upload & transcription
- PostgreSQL chunk storage
- Functional chatbot with conversation memory

---

## Prerequisites

| Component | Version | Required |
|-----------|---------|----------|
| Python | 3.10+ | ✅ |
| PostgreSQL | 14+ | ✅ |
| pip | latest | ✅ |
| Tesseract OCR | 5.0+ | Optional (for scanned PDFs) |

---

## 1. Environment Setup

### Clone and Navigate
```bash
cd Shifa/backend/rag-service2
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Configure Environment
Create or update `.env` in the `rag-service2` directory:
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shifa_db
DB_USER=postgres
DB_PASSWORD=your_password

# Gemini LLM
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 2. Database Migration

Run the migration to create the RAG-specific tables:

```bash
python db/run_migrations.py
```

This creates:
- `rag_documents` — Upload metadata (no binary files stored)
- `rag_document_chunks` — Parsed/chunked content with ordering
- `rag_chat_sessions` — Session tracking
- `rag_chat_messages` — Conversation history

All tables use `IF NOT EXISTS`, so re-running is safe.

---

## 3. Generate Dummy Data

### Generate Sample PDF (4-page medical report)
```bash
python dummy_data/generate_dummy_pdf.py
```
Outputs: `dummy_data/sample_medical_report.pdf`

### Generate Sample Audio WAV
```bash
python dummy_data/generate_dummy_audio.py
```
Outputs: `dummy_data/sample_consultation.wav`

The transcript is pre-written at: `dummy_data/sample_transcript.txt`

---

## 4. Start the Server

```bash
python app.py
```

Server starts at: `http://localhost:8000`

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 5. API Endpoints Reference

### Health Check
```
GET /api/v1/health
```

### Upload PDF
```
POST /api/v1/ingest/pdf
Content-Type: multipart/form-data

Fields:
  - file: PDF file (required)
  - patient_id: string (required)
  - session_id: string (optional, for session-scoped retrieval)
  - visit_id: string (optional)
```

### Upload Audio
```
POST /api/v1/ingest/audio
Content-Type: multipart/form-data

Fields:
  - file: Audio file - wav, mp3, m4a, ogg, flac (required)
  - patient_id: string (required)
  - visit_id: string (required)
  - session_id: string (optional, for session-scoped retrieval)
```

### Chat
```
POST /api/v1/chat
Content-Type: application/json

Body:
{
  "session_id": "your-session-id",
  "question": "What medications were prescribed?"
}
```

### Vector Index Management
```
POST   /api/v1/index/patient/{patient_id}   — Reindex patient
DELETE /api/v1/index/patient/{patient_id}   — Delete patient index
GET    /api/v1/index/stats                  — Collection stats
```

---

## 6. Manual Verification (Quick Test)

### Step 1: Upload the dummy PDF
```bash
curl -X POST http://localhost:8000/api/v1/ingest/pdf \
  -F "file=@dummy_data/sample_medical_report.pdf" \
  -F "patient_id=test-patient-001" \
  -F "session_id=demo-session-001"
```

### Step 2: Upload the dummy audio
```bash
curl -X POST http://localhost:8000/api/v1/ingest/audio \
  -F "file=@dummy_data/sample_consultation.wav" \
  -F "patient_id=test-patient-001" \
  -F "visit_id=demo-visit-001" \
  -F "session_id=demo-session-001"
```

### Step 3: Ask questions
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "demo-session-001", "question": "What is the patient diagnosis?"}'
```

### Step 4: Follow-up question (uses memory)
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "demo-session-001", "question": "What medications were prescribed for that?"}'
```

---

## 7. Running Tests

### All Tests
```bash
python -m pytest tests/ -v
```

### Individual Test Suites

**PDF Ingestion Tests:**
```bash
python -m pytest tests/test_pdf_ingestion.py -v
```

**Audio Ingestion Tests:**
```bash
python -m pytest tests/test_audio_ingestion.py -v
```

**Chatbot Comprehensive Tests:**
```bash
python -m pytest tests/test_chatbot_comprehensive.py -v
```

**End-to-End Integration Tests:**
```bash
python -m pytest tests/test_integration_e2e.py -v
```

**Existing API Endpoint Tests (regression):**
```bash
python -m pytest tests/test_api_endpoints.py -v
```

---

## 8. Architecture Summary

```
Upload PDF/Audio
       │
       ▼
┌─────────────────────┐
│  ingestion/pdf.py   │  Extract text (pypdf/pdfplumber/OCR)
│  ingestion/audio.py │  Transcribe (Gemini/SpeechRecognition)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Clean & Normalize Text             │
│  Semantic Chunking with Headings    │
│  Table Extraction (PDF)             │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  PostgreSQL          │    │  ChromaDB             │
│  rag_documents       │    │  Vector embeddings    │
│  rag_document_chunks │    │  Similarity search    │
│  rag_chat_messages   │    │                       │
└──────────┬───────────┘    └──────────┬────────────┘
           │                           │
           └─────────┬────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│  services/chat_service.py            │
│  Combined Retrieval (PG + ChromaDB)  │
│  Conversation Memory                 │
│  Gemini LLM Generation              │
└──────────────────────────────────────┘
```

### Key Design Decisions

1. **No binary storage**: Original PDFs and audio files are discarded after processing. Only parsed text, chunks, and metadata are stored.

2. **Dual storage**: Chunks are stored in both PostgreSQL (`rag_document_chunks`) and ChromaDB (embeddings). PostgreSQL provides keyword search; ChromaDB provides semantic search.

3. **Session-scoped retrieval**: Uploaded content is scoped to the chat session. Different sessions cannot access each other's uploads.

4. **`rag_` table prefix**: New tables avoid conflicts with the Java backend's existing schema.

5. **Backward compatibility**: The existing `uploaded_documents`, `ocr_results`, and `transcripts` tables are still populated for the Java backend.

---

## 9. Files Changed / Created

### New Files
| File | Purpose |
|------|---------|
| `db/migration_001_rag_tables.sql` | Database migration |
| `db/run_migrations.py` | Migration runner |
| `db/document_repository.py` | Document chunk repository |
| `dummy_data/generate_dummy_pdf.py` | Dummy PDF generator |
| `dummy_data/generate_dummy_audio.py` | Dummy audio generator |
| `dummy_data/sample_transcript.txt` | Sample consultation transcript |
| `tests/test_pdf_ingestion.py` | PDF test suite (10 tests) |
| `tests/test_audio_ingestion.py` | Audio test suite (12 tests) |
| `tests/test_chatbot_comprehensive.py` | Chatbot test suite (10 tests) |
| `tests/test_integration_e2e.py` | E2E integration tests (10 steps) |
| `SETUP_AND_VERIFY.md` | This documentation |

### Modified Files
| File | Changes |
|------|---------|
| `config.py` | Added `.flac` format, `SIMILARITY_THRESHOLD` |
| `requirements.txt` | Added `reportlab`, `pytest`, `httpx` |
| `app.py` | Added `session_id` to ingestion endpoints |
| `dto/schemas.py` | Added `rag_document_id`, `db_chunks_stored`, `pages_processed` |
| `db/chat_repository.py` | Uses `rag_chat_*` tables, auto-creates sessions |
| `ingestion/pdf.py` | Table extraction, text cleaning, semantic chunking, PG storage |
| `ingestion/audio.py` | FLAC support, transcript cleaning, chunking, PG storage |
| `services/retriever.py` | Combined ChromaDB + PostgreSQL search |
| `services/chat_service.py` | Session-scoped combined retrieval |
