CREATE TABLE doctors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE REFERENCES users(id),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    specialization      VARCHAR(200),
    registration_number VARCHAR(50) UNIQUE,
    qualification       VARCHAR(500),
    clinic_name         VARCHAR(300),
    clinic_address      TEXT,
    phone               VARCHAR(15),
    city                VARCHAR(100),
    state               VARCHAR(100),
    consultation_fee    DECIMAL(10,2),
    profile_photo_url   TEXT,
    bio                 TEXT,
    languages_spoken    VARCHAR(10)[],
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_doctor_name_trgm
    ON doctors USING gin((first_name || ' ' || last_name) gin_trgm_ops)
    WHERE deleted = FALSE;

CREATE INDEX idx_doctor_city      ON doctors(city) WHERE deleted = FALSE;
CREATE INDEX idx_doctor_specializ ON doctors(specialization) WHERE deleted = FALSE;
