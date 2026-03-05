CREATE TABLE patient_consents (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id        UUID NOT NULL REFERENCES patients(id),
    consent_type      VARCHAR(50) NOT NULL,
    granted           BOOLEAN NOT NULL,
    consented_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address        VARCHAR(45),
    user_agent        TEXT,
    consent_version   VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    withdrawn_at      TIMESTAMP,
    withdrawal_reason TEXT,
    CONSTRAINT chk_consent_type CHECK (
        consent_type IN ('DATA_PROCESSING', 'WHATSAPP_COMMS', 'RESEARCH', 'ABDM', 'MARKETING')
    )
);

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    user_role     VARCHAR(20),
    action_type   VARCHAR(20) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id   UUID,
    phi_accessed  BOOLEAN NOT NULL DEFAULT FALSE,
    phi_elements  JSONB,
    ip_address    VARCHAR(45),
    session_id    VARCHAR(255),
    success       BOOLEAN NOT NULL DEFAULT TRUE,
    error_detail  TEXT,
    accessed_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

CREATE INDEX idx_audit_user ON audit_logs(user_id, accessed_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_phi ON audit_logs(accessed_at DESC) WHERE phi_accessed = TRUE;
CREATE INDEX idx_audit_date ON audit_logs(accessed_at DESC);
CREATE INDEX idx_consent_patient ON patient_consents(patient_id, consent_type);
