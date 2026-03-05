CREATE TABLE notifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id    UUID NOT NULL REFERENCES patients(id),
    visit_id      UUID REFERENCES visits(id),
    type          VARCHAR(50) NOT NULL,
    title         VARCHAR(300),
    message       TEXT NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    sent_at       TIMESTAMP,
    channel       VARCHAR(20) NOT NULL DEFAULT 'WHATSAPP',
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count   SMALLINT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notif_channel CHECK (channel IN ('WHATSAPP', 'SMS', 'EMAIL')),
    CONSTRAINT chk_notif_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED'))
);

CREATE TABLE whatsapp_message_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id        UUID REFERENCES visits(id),
    patient_id      UUID NOT NULL REFERENCES patients(id),
    meta_message_id VARCHAR(255) NOT NULL UNIQUE,
    phone_number    VARCHAR(15) NOT NULL,
    message_type    VARCHAR(50) NOT NULL DEFAULT 'text',
    template_name   VARCHAR(100),
    message_preview VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered_at    TIMESTAMP,
    read_at         TIMESTAMP,
    error_code      VARCHAR(50)
);

CREATE INDEX idx_notif_pending ON notifications(scheduled_for, channel) WHERE status = 'PENDING';
CREATE INDEX idx_notif_patient ON notifications(patient_id);
CREATE INDEX idx_wa_log_meta ON whatsapp_message_log(meta_message_id);
CREATE INDEX idx_wa_log_patient ON whatsapp_message_log(patient_id);
