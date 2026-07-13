DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'role'
          AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE users
            ALTER COLUMN role TYPE VARCHAR(20)
            USING role::text;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patients'
          AND column_name = 'preferred_language'
          AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE patients
            ALTER COLUMN preferred_language TYPE VARCHAR(10)
            USING preferred_language::text;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'patients'
          AND column_name = 'gender'
          AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE patients
            ALTER COLUMN gender TYPE VARCHAR(30)
            USING gender::text;
    END IF;
END $$;
