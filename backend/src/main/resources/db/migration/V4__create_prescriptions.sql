CREATE TABLE patients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE REFERENCES users(id),
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  phone_number        VARCHAR(15) UNIQUE NOT NULL,
  email               VARCHAR(255) UNIQUE,
  date_of_birth       DATE,
  gender              gender_type,
  abha_id             VARCHAR(17) UNIQUE,
  preferred_language  language_code NOT NULL DEFAULT 'HI',
  city                VARCHAR(100),
  state               VARCHAR(100),
  blood_group         VARCHAR(5),
  emergency_contact   VARCHAR(15),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES users(id),
  deleted             BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT chk_phone_format CHECK (phone_number ~ '^[6-9][0-9]{9}$')
);

CREATE TABLE patient_allergies (
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergy     VARCHAR(200) NOT NULL,
  PRIMARY KEY (patient_id, allergy)
);

CREATE TABLE patient_chronic_conditions (
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition   VARCHAR(200) NOT NULL,
  PRIMARY KEY (patient_id, condition)
);

CREATE TABLE patient_doctors (
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id           UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  first_visit_at      DATE,
  is_primary_doctor   BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (patient_id, doctor_id)
);

CREATE INDEX idx_patient_phone    ON patients(phone_number) WHERE deleted = FALSE;
CREATE INDEX idx_patient_abha     ON patients(abha_id) WHERE abha_id IS NOT NULL;
CREATE INDEX idx_patient_language ON patients(preferred_language);
CREATE INDEX idx_patient_state    ON patients(state) WHERE deleted = FALSE;

CREATE INDEX idx_patient_name_trgm
  ON patients USING gin((first_name || ' ' || last_name) gin_trgm_ops)
  WHERE deleted = FALSE;
