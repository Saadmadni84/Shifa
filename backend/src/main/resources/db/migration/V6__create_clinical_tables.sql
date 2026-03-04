CREATE TABLE vital_signs (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id                 UUID UNIQUE NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    blood_pressure_systolic  SMALLINT,
    blood_pressure_diastolic SMALLINT,
    heart_rate               SMALLINT,
    temperature_celsius      DECIMAL(4,1),
    spo2_percentage          SMALLINT,
    respiratory_rate         SMALLINT,
    weight_kg                DECIMAL(5,2),
    height_cm                DECIMAL(5,2),
    bmi                      DECIMAL(4,1) GENERATED ALWAYS AS (
        CASE WHEN height_cm > 0
             THEN ROUND((weight_kg / ((height_cm/100.0) * (height_cm/100.0)))::NUMERIC, 1)
             ELSE NULL END
    ) STORED,
    blood_sugar_fasting      DECIMAL(6,2),
    blood_sugar_random       DECIMAL(6,2),
    blood_sugar_hba1c        DECIMAL(4,1),
    recorded_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    recorded_by              UUID REFERENCES users(id),
    CONSTRAINT chk_bp_systolic CHECK (blood_pressure_systolic BETWEEN 50 AND 300),
    CONSTRAINT chk_bp_diastolic CHECK (blood_pressure_diastolic BETWEEN 30 AND 200),
    CONSTRAINT chk_heart_rate CHECK (heart_rate BETWEEN 20 AND 300),
    CONSTRAINT chk_spo2 CHECK (spo2_percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_temperature CHECK (temperature_celsius BETWEEN 30.0 AND 45.0)
);

CREATE TABLE conditions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id        UUID REFERENCES visits(id),
    patient_id      UUID NOT NULL REFERENCES patients(id),
    icd_code        VARCHAR(10),
    icd_description VARCHAR(300),
    snomed_code     VARCHAR(20),
    description     TEXT NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    onset_date      DATE,
    resolved_date   DATE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_condition_status CHECK (status IN ('active', 'resolved', 'chronic', 'suspected'))
);

CREATE INDEX idx_condition_patient ON conditions(patient_id) WHERE deleted = FALSE;
CREATE INDEX idx_condition_visit   ON conditions(visit_id) WHERE deleted = FALSE;
CREATE INDEX idx_condition_icd     ON conditions(icd_code) WHERE deleted = FALSE;
CREATE INDEX idx_vital_visit       ON vital_signs(visit_id);
