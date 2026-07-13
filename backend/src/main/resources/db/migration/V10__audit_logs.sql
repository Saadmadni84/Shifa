CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID,
    user_role       VARCHAR(20),
    action_type     VARCHAR(50)  NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    phi_accessed    BOOLEAN      DEFAULT FALSE,
    ip_address      VARCHAR(45),
    success         BOOLEAN      DEFAULT TRUE,
    failure_reason  VARCHAR(200),
    accessed_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    extra_context   TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_user_date  ON audit_logs(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_phi        ON audit_logs(phi_accessed) WHERE phi_accessed = TRUE;
CREATE INDEX IF NOT EXISTS idx_audit_resource   ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_date       ON audit_logs(accessed_at DESC);
