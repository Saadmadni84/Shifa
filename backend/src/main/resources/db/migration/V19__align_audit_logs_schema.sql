ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS action       VARCHAR(100),
    ADD COLUMN IF NOT EXISTS entity_type  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS entity_id    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS user_agent   VARCHAR(500),
    ADD COLUMN IF NOT EXISTS details      TEXT,
    ADD COLUMN IF NOT EXISTS created_at   TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);