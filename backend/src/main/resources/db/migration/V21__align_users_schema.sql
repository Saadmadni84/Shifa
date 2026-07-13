ALTER TABLE users
    ADD COLUMN IF NOT EXISTS display_name          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS preferred_language    VARCHAR(10),
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_locked_until  TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(account_locked_until)
    WHERE account_locked_until IS NOT NULL;