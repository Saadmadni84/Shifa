CREATE TABLE prescriptions (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id              UUID UNIQUE NOT NULL REFERENCES visits(id),
    special_instructions  TEXT,
    diet_advice           TEXT,
    activity_restrictions TEXT,
    document_url          TEXT,
    ocr_extracted_text    TEXT,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted               BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE medications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    generic_name    VARCHAR(200),
    brand_note      VARCHAR(200),
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    timing          VARCHAR(200),
    duration_days   SMALLINT,
    quantity        SMALLINT,
    instructions    TEXT,
    is_critical     BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      SMALLINT NOT NULL DEFAULT 0,
    rxnorm_code     VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_duration CHECK (duration_days IS NULL OR duration_days > 0),
    CONSTRAINT chk_quantity CHECK (quantity IS NULL OR quantity > 0)
);

CREATE INDEX idx_medication_prescription ON medications(prescription_id) WHERE deleted = FALSE;
CREATE INDEX idx_medication_critical ON medications(prescription_id) WHERE is_critical = TRUE;
CREATE INDEX idx_prescription_visit ON prescriptions(visit_id);
