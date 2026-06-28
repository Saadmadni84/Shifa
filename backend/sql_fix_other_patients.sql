DO $$
DECLARE
    pr_id uuid;
    dr_id uuid;
    org_id uuid;
BEGIN
    SELECT id INTO pr_id FROM practitioners LIMIT 1;
    SELECT id INTO dr_id FROM doctors LIMIT 1;
    SELECT id INTO org_id FROM organizations LIMIT 1;

    -- Hari
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, '1adc6d4d-c8a3-469e-8bf6-d5729d04829b', pr_id, dr_id, org_id, '2026-03-01', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Persistent cough and fever', '{"quickSummary": "Persistent cough and fever for 3 days."}', false),
    (gen_random_uuid(), gen_random_uuid()::varchar, '1adc6d4d-c8a3-469e-8bf6-d5729d04829b', pr_id, dr_id, org_id, '2026-03-10', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Follow-up for bronchitis', '{"quickSummary": "Follow-up for bronchitis, feeling much better."}', false);

    -- Meera
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, 'bf387433-b820-48a4-b2ff-799341b5f231', pr_id, dr_id, org_id, '2026-02-15', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Routine checkup and blood work', '{"quickSummary": "Routine checkup and blood work."}', false),
    (gen_random_uuid(), gen_random_uuid()::varchar, 'bf387433-b820-48a4-b2ff-799341b5f231', pr_id, dr_id, org_id, '2026-02-22', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Review of lab results', '{"quickSummary": "Review of lab results. Mild anemia identified."}', false);

    -- Sneha
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, '4c2e8a2d-6750-4cb3-862e-64771a4ed939', pr_id, dr_id, org_id, '2026-01-10', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Frequent migraines', '{"quickSummary": "Frequent migraines reported."}', false),
    (gen_random_uuid(), gen_random_uuid()::varchar, '4c2e8a2d-6750-4cb3-862e-64771a4ed939', pr_id, dr_id, org_id, '2026-02-05', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Follow up on migraine medication', '{"quickSummary": "Follow up on migraine medication. Experiencing fewer episodes."}', false);

END $$;
