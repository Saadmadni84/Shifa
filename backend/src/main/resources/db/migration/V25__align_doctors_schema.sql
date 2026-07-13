-- V25: Align doctors table with Doctor entity (add missing columns)
-- The live shifa_db doctors table is missing several columns added by
-- entity evolution. This migration brings it in sync.

-- ── Audit columns from AuditableEntity ──────────────────────────────────────
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS created_by    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS updated_by    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMP,
    ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- ── Doctor-specific columns ──────────────────────────────────────────────────
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS is_available     BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS experience_years INTEGER,
    ADD COLUMN IF NOT EXISTS total_patients   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_visits     INTEGER NOT NULL DEFAULT 0;

-- ── Clinic embedded columns (replacing old flat phone/city/state) ────────────
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS clinic_city    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS clinic_state   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS clinic_pincode VARCHAR(10),
    ADD COLUMN IF NOT EXISTS clinic_phone   VARCHAR(15),
    ADD COLUMN IF NOT EXISTS clinic_timing  VARCHAR(200);

-- Migrate old city/state/phone into new clinic_* columns if they exist
UPDATE doctors SET clinic_city  = city  WHERE city  IS NOT NULL AND clinic_city  IS NULL;
UPDATE doctors SET clinic_state = state WHERE state IS NOT NULL AND clinic_state IS NULL;
UPDATE doctors SET clinic_phone = phone WHERE phone IS NOT NULL AND clinic_phone IS NULL;

-- ── Rename clinic_name length to match entity (200) – already correct ────────
-- clinic_name is VARCHAR(300) in live DB vs length=200 in entity; leave it,
-- VARCHAR is max so a shorter entity length causes no insert error.

-- ── doctor_languages collection table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_languages (
    doctor_id UUID         NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    language  VARCHAR(50)  NOT NULL,
    PRIMARY KEY (doctor_id, language)
);

-- ── Indexes expected by entity ────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'doctors' AND indexname = 'idx_doctor_reg'
    ) THEN
        CREATE UNIQUE INDEX idx_doctor_reg ON doctors(registration_number);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'doctors' AND indexname = 'idx_doctor_user'
    ) THEN
        CREATE INDEX idx_doctor_user ON doctors(user_id);
    END IF;
END $$;

-- ── Unique constraint on user_id (entity: unique=true on JoinColumn) ─────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uk_t1f6cueqyjwx5ghew9ar1exe3'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT uk_t1f6cueqyjwx5ghew9ar1exe3 UNIQUE (user_id);
    END IF;
END $$;
