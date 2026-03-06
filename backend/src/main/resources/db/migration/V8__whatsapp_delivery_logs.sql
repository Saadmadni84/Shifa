CREATE TABLE whatsapp_delivery_logs (
    id              BIGSERIAL PRIMARY KEY,
    meta_message_id VARCHAR(200) NOT NULL,
    status          VARCHAR(20)  NOT NULL,
    timestamp       TIMESTAMP    NOT NULL,
    raw_payload     TEXT,
    synced          BOOLEAN      DEFAULT FALSE,
    synced_at       TIMESTAMP,
    created_at      TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_wa_log_meta    ON whatsapp_delivery_logs(meta_message_id);
CREATE INDEX idx_wa_log_synced  ON whatsapp_delivery_logs(synced) WHERE synced = FALSE;
