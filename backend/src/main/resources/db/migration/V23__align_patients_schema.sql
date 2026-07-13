ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
    ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS known_conditions TEXT,
    ADD COLUMN IF NOT EXISTS current_medicines_text TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(15);

UPDATE patients
SET emergency_contact_phone = emergency_contact
WHERE emergency_contact_phone IS NULL
  AND emergency_contact IS NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patient_chronic_conditions'
          AND column_name = 'condition'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patient_chronic_conditions'
          AND column_name = 'condition_name'
    ) THEN
        ALTER TABLE patient_chronic_conditions
            RENAME COLUMN condition TO condition_name;
    END IF;
END $$;
