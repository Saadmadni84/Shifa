DO $$
DECLARE
    pr_id uuid;
    dr_id uuid;
    org_id uuid;
BEGIN
    SELECT id INTO pr_id FROM practitioners LIMIT 1;
    SELECT id INTO dr_id FROM doctors LIMIT 1;
    SELECT id INTO org_id FROM organizations LIMIT 1;

    -- Delete old unhelpful visits
    DELETE FROM visits WHERE patient_id IN (
        '1adc6d4d-c8a3-469e-8bf6-d5729d04829b', 
        'bf387433-b820-48a4-b2ff-799341b5f231', 
        '4c2e8a2d-6750-4cb3-862e-64771a4ed939'
    );

    --------------------------------------------------------------------------------
    -- Henri Lambert (Patient ID: 1adc6d4d-c8a3-469e-8bf6-d5729d04829b)
    --------------------------------------------------------------------------------
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, '1adc6d4d-c8a3-469e-8bf6-d5729d04829b', pr_id, dr_id, org_id, '2026-03-01', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Persistent cough and fever', 
    '{"isDetailed":true,"quickSummary":"Patient presents with a 3-day history of persistent cough, low-grade fever, and mild shortness of breath. Diagnosed with acute bronchitis. Prescribed Amoxicillin and Albuterol inhaler.","historyOfPresentIllness":"Mr. Lambert is a 38-year-old male presenting with a 3-day history of a productive cough (yellowish sputum), low-grade fever (max 100.2 F), and mild shortness of breath upon exertion. He notes the cough worsens at night, disrupting his sleep. No chest pain, no recent travel, no known sick contacts. H/O childhood asthma but hasn''t required inhalers in years.","reportedSymptoms":"Constitutional: Chills, fatigue. Respiratory: Productive cough, mild dyspnea. ENT: Mild sore throat.","physicalExamination":"General: Alert, in mild respiratory distress. Vitals: HR 88, BP 120/78, RR 18, Temp 99.8 F, SpO2 96% on RA. Lungs: Rhonchi scattered bilaterally, clears partially with coughing. Occasional wheeze. Heart: RRR, no murmurs.","assessment":"Acute bronchitis, likely bacterial given purulent sputum. Mild exacerbation of underlying reactive airway disease.","plan":["Start Amoxicillin 500mg PO TID for 7 days.","Albuterol HFA 2 puffs Q4-6H PRN for wheezing/shortness of breath.","Rest, hydrate, use a humidifier at night.","Return to clinic if fever exceeds 101F or if symptoms worsen."],"followUp":"1 week for re-evaluation if not improving.","testResults":[{"name":"Chest X-Ray","status":"Normal","value":"No focal consolidation, pneumothorax, or pleural effusion.","date":"Mar 01"}],"medicationsPrescribed":[{"name":"Amoxicillin 500mg","instruction":"500 mg · Every 8 hours","notes":"Complete the full course."},{"name":"Albuterol HFA","instruction":"2 puffs · Every 4-6 hours PRN","notes":"Shake well before use."}],"transcript":[{"time":"00:00","speaker":"DR. BENNETT","text":"Hi Henri, I hear you''ve been having a tough time with a cough."},{"time":"00:05","speaker":"PATIENT","text":"Yeah, it started three days ago. Yesterday I started bringing up this yellow stuff, and I feel really exhausted."}]}',
    false);

    --------------------------------------------------------------------------------
    -- Marie Dupont (Patient ID: bf387433-b820-48a4-b2ff-799341b5f231)
    --------------------------------------------------------------------------------
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, 'bf387433-b820-48a4-b2ff-799341b5f231', pr_id, dr_id, org_id, '2026-02-15', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Routine checkup and blood work', 
    '{"isDetailed":true,"quickSummary":"Routine follow-up for Hypothyroidism. Patient reports fatigue and weight gain. Lab results show elevated TSH. Levothyroxine dose adjusted.","historyOfPresentIllness":"Ms. Dupont is a 34-year-old female presenting for a routine follow-up of her Hashimoto''s hypothyroidism. She reports increasing fatigue over the past two months, along with a 5 lb weight gain, despite no changes in her diet or exercise routine. She also notes mild constipation and dry skin. She has been taking her Levothyroxine 50mcg daily faithfully on an empty stomach.","reportedSymptoms":"Constitutional: Fatigue, weight gain. Skin: Dry skin. GI: Mild constipation. Neuro: No depression, no cold intolerance noted.","physicalExamination":"General: Well-nourished, comfortable. Vitals: HR 64, BP 112/70, RR 14, Temp 98.2 F. Neck: Thyroid is slightly enlarged, firm, non-tender, no discrete nodules. Skin: Slightly dry, cool to touch. Neuro: DTRs have slightly delayed relaxation phase.","assessment":"Hypothyroidism (Hashimoto''s) - Suboptimally controlled currently. Recent labs show TSH at 6.8 mIU/L (elevated) and free T4 at the lower limit of normal.","plan":["Increase Levothyroxine from 50mcg to 75mcg daily.","Continue taking medication first thing in the morning 30-60 mins before food/coffee.","Recommend liberal fluid and fiber intake for constipation.","Repeat Thyroid panel in 6 weeks."],"followUp":"6 weeks for lab review and symptom check.","testResults":[{"name":"TSH (Thyroid Stimulating Hormone)","status":"High","value":"6.8 mIU/L","date":"Feb 15"},{"name":"Free T4","status":"Normal","value":"0.9 ng/dL","date":"Feb 15"}],"medicationsPrescribed":[{"name":"Levothyroxine 75mcg","instruction":"75 mcg · Once daily in the morning","notes":"Take on an empty stomach."}],"transcript":[{"time":"00:00","speaker":"DR. VANCE","text":"Good morning, Marie. Your labs came back and your TSH is a bit high, which explains why you''ve been feeling so tired."},{"time":"00:08","speaker":"PATIENT","text":"That makes sense. I was worried I was just being lazy, but I haven''t changed anything about my routine."}]}',
    false);

    --------------------------------------------------------------------------------
    -- Sofia Kowalska (Patient ID: 4c2e8a2d-6750-4cb3-862e-64771a4ed939)
    --------------------------------------------------------------------------------
    INSERT INTO visits (id, fhir_encounter_id, patient_id, practitioner_id, doctor_id, organization_id, visit_date, visit_type, class, visit_status, status, chief_complaint, raw_notes, deleted)
    VALUES 
    (gen_random_uuid(), gen_random_uuid()::varchar, '4c2e8a2d-6750-4cb3-862e-64771a4ed939', pr_id, dr_id, org_id, '2026-01-10', 'office_visit', 'AMB', 'completed', 'COMPLETED', 'Frequent migraines', 
    '{"isDetailed":true,"quickSummary":"Follow-up for chronic migraines. Patient reports 4 episodes last month. Sumatriptan provides relief but is causing slight nausea. Adjusting preventive and acute therapy.","historyOfPresentIllness":"Ms. Kowalska is a 51-year-old female returning for migraine management. She reports 4 severe headache episodes over the past month, typically unilateral (right-sided), throbbing in nature, accompanied by photophobia and phonophobia. She uses Sumatriptan 50mg which effectively aborts the migraine within 2 hours, but complains it causes significant post-dose nausea. Her current preventative, Amitriptyline 25mg, seems to be losing efficacy.","reportedSymptoms":"Neuro: Headaches as described. GI: Nausea with Sumatriptan use. Vision: Photophobia during episodes. Other: No aura, no weakness or numbness.","physicalExamination":"General: NAD. Vitals: HR 72, BP 118/76. Neuro: Cranial nerves II-XII intact. Full strength (5/5) in all extremities. Normal gait and coordination. Sensation intact globally. Fundoscopic exam normal.","assessment":"Chronic migraine without aura. Suboptimal response to Amitriptyline for prevention; Sumatriptan effective but poorly tolerated due to nausea.","plan":["Taper Amitriptyline 25mg down over 1 week and discontinue.","Start Topiramate 25mg nightly as a new preventative therapy.","Switch acute abortive therapy from Sumatriptan to Rizatriptan 10mg PRN.","Prescribe Ondansetron 4mg ODT PRN for nausea.","Maintain headache diary."],"followUp":"4 weeks to assess response to Topiramate.","testResults":[],"medicationsPrescribed":[{"name":"Topiramate 25mg","instruction":"25 mg · Once nightly","notes":"May cause tingling in fingers; titrate slowly."},{"name":"Rizatriptan 10mg","instruction":"10 mg · At onset of migraine","notes":"Max 30mg per 24hrs."},{"name":"Ondansetron 4mg ODT","instruction":"4 mg · PRN for nausea","notes":"Dissolve under tongue."}],"transcript":[{"time":"00:00","speaker":"DR. BASHIR","text":"Hello Sofia. How are the migraines currently? Last time you mentioned the Amitriptyline was helping."},{"time":"00:07","speaker":"PATIENT","text":"It was, but this past month I''ve had four bad attacks. And the Sumatriptan makes me so nauseous I can barely function even after the headache is gone."}]}',
    false);

END $$;
