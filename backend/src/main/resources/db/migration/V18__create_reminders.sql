CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE reminders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID NOT NULL REFERENCES patients(id),
    medication_id   UUID REFERENCES medications(id),
    reminder_text   TEXT NOT NULL,
    next_trigger_at TIMESTAMP NOT NULL,
    recurrence      VARCHAR(30) NOT NULL,
    recurrence_times TEXT,
    end_date        DATE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    channel         VARCHAR(20) DEFAULT 'WHATSAPP',
    times_sent      INTEGER NOT NULL DEFAULT 0,
    last_sent_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    delete_reason   TEXT
);

CREATE INDEX idx_reminder_patient ON reminders(patient_id);
CREATE INDEX idx_reminder_due ON reminders(next_trigger_at);
CREATE INDEX idx_reminder_active ON reminders(active);