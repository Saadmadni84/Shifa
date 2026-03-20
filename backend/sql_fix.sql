DO $$
DECLARE
    pr_id uuid;
    dr_id uuid;
    org_id uuid;
BEGIN
    SELECT id INTO pr_id FROM practitioners LIMIT 1;
    SELECT id INTO dr_id FROM doctors LIMIT 1;
    SELECT id INTO org_id FROM organizations LIMIT 1;

    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, '9894f70a-b303-450a-87da-ddf725c1b0cd', pr_id, dr_id, org_id, '2026-03-18', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Chest pain and irregular heartbeat', '{"quickSummary": "Chest pain and irregular heartbeat."}', false),
    (gen_random_uuid(), gen_random_uuid()::varchar, '9894f70a-b303-450a-87da-ddf725c1b0cd', pr_id, dr_id, org_id, '2026-03-19', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Follow-up for hypertension', '{"quickSummary": "Follow-up for hypertension."}', false);
END $$;
