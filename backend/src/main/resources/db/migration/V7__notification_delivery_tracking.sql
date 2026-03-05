ALTER TABLE notifications
    ADD COLUMN meta_message_id   VARCHAR(100),
    ADD COLUMN delivery_status   VARCHAR(20) DEFAULT 'SENT',
    ADD COLUMN delivered_at      TIMESTAMP,
    ADD COLUMN read_at           TIMESTAMP,
    ADD COLUMN scheduled_for     TIMESTAMP,
    ADD COLUMN type              VARCHAR(50),
    ADD COLUMN error_message     TEXT,
    ADD COLUMN retry_count       SMALLINT DEFAULT 0;

CREATE INDEX idx_notif_meta_msg_id ON notifications(meta_message_id)
    WHERE meta_message_id IS NOT NULL;
