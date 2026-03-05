CREATE TABLE visits (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id              UUID NOT NULL REFERENCES patients(id),
  doctor_id               UUID NOT NULL REFERENCES doctors(id),
  visit_date              DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint         TEXT,
  raw_notes               TEXT,
  ai_summary              JSONB,
  diagnosis               TEXT,
  follow_up_date          DATE,
  status                  visit_status NOT NULL DEFAULT 'DRAFT',
  whatsapp_message_id     VARCHAR(255),
  whatsapp_status         whatsapp_delivery_status NOT NULL DEFAULT 'NOT_SENT',
  patient_portal_token    VARCHAR(255) UNIQUE,
  portal_token_expires_at TIMESTAMP,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by              VARCHAR(255),
  deleted                 BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT chk_follow_up_after_visit CHECK (
    follow_up_date IS NULL OR follow_up_date >= visit_date
  )
);

CREATE TABLE visit_patient_summaries (
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  language_code   VARCHAR(5) NOT NULL,
  summary_text    TEXT NOT NULL,
  generated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  word_count      INTEGER,
  PRIMARY KEY (visit_id, language_code)
);

CREATE INDEX idx_visit_patient     ON visits(patient_id) WHERE deleted = FALSE;
CREATE INDEX idx_visit_doctor      ON visits(doctor_id) WHERE deleted = FALSE;
CREATE INDEX idx_visit_date        ON visits(visit_date DESC) WHERE deleted = FALSE;
CREATE INDEX idx_visit_status      ON visits(status) WHERE deleted = FALSE;
CREATE INDEX idx_visit_token       ON visits(patient_portal_token) WHERE patient_portal_token IS NOT NULL;
CREATE INDEX idx_visit_whatsapp    ON visits(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX idx_visit_followup    ON visits(follow_up_date) WHERE follow_up_date IS NOT NULL AND deleted = FALSE;
CREATE INDEX idx_visit_ai_summary  ON visits USING gin(ai_summary) WHERE ai_summary IS NOT NULL;
CREATE INDEX idx_visit_doctor_date ON visits(doctor_id, visit_date DESC) WHERE deleted = FALSE;
