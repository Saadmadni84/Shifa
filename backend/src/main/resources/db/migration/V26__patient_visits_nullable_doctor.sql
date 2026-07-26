-- Allow patient-uploaded visits to exist without a doctor assignment
ALTER TABLE visits ALTER COLUMN doctor_id DROP NOT NULL;

-- Track who initiated the visit: DOCTOR (default) or PATIENT (self-uploaded)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'DOCTOR';

-- Index so the patient dashboard query is fast
CREATE INDEX IF NOT EXISTS idx_visit_patient_source ON visits(patient_id, source) WHERE deleted = FALSE;
