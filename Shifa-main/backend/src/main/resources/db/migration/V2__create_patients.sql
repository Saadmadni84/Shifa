CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255) UNIQUE,
  phone_number        VARCHAR(15) UNIQUE,
  password_hash       VARCHAR(255),
  role                user_role NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at   TIMESTAMP,
  last_login_at       TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT chk_user_identifier CHECK (
    email IS NOT NULL OR phone_number IS NOT NULL
  )
);

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users(email) WHERE deleted = FALSE;
CREATE INDEX idx_users_phone     ON users(phone_number) WHERE deleted = FALSE;
CREATE INDEX idx_users_role      ON users(role) WHERE deleted = FALSE;
CREATE INDEX idx_refresh_user    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at) WHERE revoked = FALSE;
