CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS chat_sessions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id         UUID NOT NULL UNIQUE REFERENCES visits(id),
    patient_language VARCHAR(5),
    total_messages   INTEGER NOT NULL DEFAULT 0,
    last_message_at  TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100),
    deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at       TIMESTAMP,
    delete_reason    TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,
    content         TEXT NOT NULL,
    language_code   VARCHAR(5),
    tokens_used     INTEGER,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    delete_reason   TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_session_visit ON chat_sessions(visit_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_session_created ON chat_messages(session_id, created_at DESC);