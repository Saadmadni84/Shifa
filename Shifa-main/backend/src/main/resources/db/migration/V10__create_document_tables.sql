CREATE TABLE uploaded_documents (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id          UUID REFERENCES visits(id),
    patient_id        UUID NOT NULL REFERENCES patients(id),
    uploaded_by       UUID REFERENCES users(id),
    original_filename VARCHAR(500),
    s3_key            TEXT NOT NULL,
    content_type      VARCHAR(100),
    file_size_bytes   BIGINT,
    file_hash         VARCHAR(64),
    document_type     VARCHAR(50) NOT NULL DEFAULT 'PRESCRIPTION',
    description       TEXT,
    is_ocr_processed  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted           BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_doc_type CHECK (
        document_type IN ('PRESCRIPTION', 'LAB_REPORT', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER')
    )
);

CREATE TABLE ocr_results (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id        UUID UNIQUE NOT NULL REFERENCES uploaded_documents(id),
    raw_text           TEXT,
    confidence_score   DECIMAL(4,3),
    languages_detected VARCHAR(10)[],
    processing_time_ms INTEGER,
    ocr_engine         VARCHAR(50) DEFAULT 'tesseract-5',
    processed_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_visit ON uploaded_documents(visit_id) WHERE deleted = FALSE;
CREATE INDEX idx_document_patient ON uploaded_documents(patient_id) WHERE deleted = FALSE;
CREATE INDEX idx_document_hash ON uploaded_documents(file_hash);
