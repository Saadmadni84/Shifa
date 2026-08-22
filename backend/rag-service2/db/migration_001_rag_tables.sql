-- =============================================================================
-- Migration 001: RAG Service Tables
-- =============================================================================
-- Creates tables for the RAG service's document ingestion, chunk storage,
-- chat sessions, and conversation history.
--
-- Uses 'rag_' prefix to avoid conflicts with the Java backend's existing
-- chat_messages / chat_sessions / uploaded_documents tables.
--
-- Idempotent: safe to run multiple times (IF NOT EXISTS).
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------
-- 1. rag_documents: Upload metadata (no binary storage)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rag_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(255) NOT NULL,
    patient_id      UUID,
    document_type   VARCHAR(50)  NOT NULL CHECK (document_type IN ('pdf', 'audio')),
    original_filename VARCHAR(500) NOT NULL,
    file_hash       VARCHAR(64),
    file_size_bytes BIGINT,
    total_pages     INTEGER,
    total_chunks    INTEGER      DEFAULT 0,
    processing_status VARCHAR(30) DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. rag_document_chunks: Parsed content with ordering
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rag_document_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID         NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index     INTEGER      NOT NULL,
    content         TEXT         NOT NULL,
    page_number     INTEGER,
    section_heading VARCHAR(500),
    chunk_metadata  JSONB        DEFAULT '{}',
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. rag_chat_sessions: Session tracking
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rag_chat_sessions (
    id              VARCHAR(255) PRIMARY KEY,
    patient_id      UUID,
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW(),
    total_messages  INTEGER      DEFAULT 0,
    total_tokens    INTEGER      DEFAULT 0,
    last_message_at TIMESTAMP
);

-- ---------------------------------------------------------
-- 4. rag_chat_messages: Conversation history
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rag_chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT         NOT NULL,
    language_code   VARCHAR(10)  DEFAULT 'en',
    tokens_used     INTEGER,
    created_by      VARCHAR(50)  DEFAULT 'SYSTEM',
    created_at      TIMESTAMP    DEFAULT NOW(),
    deleted         BOOLEAN      DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    delete_reason   VARCHAR(255)
);

-- ---------------------------------------------------------
-- Indexes for query performance
-- ---------------------------------------------------------
ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS patient_id UUID;
ALTER TABLE rag_chat_sessions ADD COLUMN IF NOT EXISTS patient_id UUID;

CREATE INDEX IF NOT EXISTS idx_rag_docs_session
    ON rag_documents(session_id);

CREATE INDEX IF NOT EXISTS idx_rag_docs_patient
    ON rag_documents(patient_id);

CREATE INDEX IF NOT EXISTS idx_rag_docs_type
    ON rag_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document
    ON rag_document_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_order
    ON rag_document_chunks(document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_rag_msgs_session
    ON rag_chat_messages(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_rag_msgs_not_deleted
    ON rag_chat_messages(session_id)
    WHERE deleted = FALSE;

-- Full-text search index on chunk content for keyword retrieval
CREATE INDEX IF NOT EXISTS idx_rag_chunks_content_fts
    ON rag_document_chunks
    USING GIN (to_tsvector('english', content));
