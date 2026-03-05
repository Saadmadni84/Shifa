-- visits.follow_up_date, visits.status, and visits.deleted already exist (defined in V5).
-- Add the soft-delete audit column that is missing from the visits table.
ALTER TABLE visits ADD COLUMN deleted_at TIMESTAMP;

-- patients.deleted already exists (defined in V4).
-- Add soft-delete audit columns that are missing from the patients table.
ALTER TABLE patients ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE patients ADD COLUMN delete_reason VARCHAR(255);
