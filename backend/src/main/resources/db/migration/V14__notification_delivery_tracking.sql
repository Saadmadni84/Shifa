ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS meta_message_id   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS delivery_status   VARCHAR(20) DEFAULT 'SENT',
    ADD COLUMN IF NOT EXISTS delivered_at      TIMESTAMP,
    ADD COLUMN IF NOT EXISTS read_at           TIMESTAMP,
    ADD COLUMN IF NOT EXISTS scheduled_for     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS type              VARCHAR(50),
    ADD COLUMN IF NOT EXISTS error_message     TEXT,
    ADD COLUMN IF NOT EXISTS retry_count       SMALLINT DEFAULT 0;

CREATE INDEX idx_notif_meta_msg_id ON notifications(meta_message_id)
    WHERE meta_message_id IS NOT NULL;
