DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patients'
          AND column_name = 'created_by'
          AND udt_name = 'uuid'
    ) THEN
        ALTER TABLE patients
            DROP CONSTRAINT IF EXISTS patients_created_by_fkey;

        ALTER TABLE patients
            ALTER COLUMN created_by TYPE VARCHAR(100)
            USING created_by::text;
    END IF;
END $$;

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);
