UPDATE patients 
SET known_conditions = 'Childhood Asthma, Reactive Airway Disease',
    allergies = '["None known"]'::jsonb,
    blood_group = 'O+',
    height_cm = 180,
    weight_kg = 78,
    current_medicines_text = 'Albuterol PRN'
WHERE id = '1adc6d4d-c8a3-469e-8bf6-d5729d04829b';

UPDATE patients 
SET known_conditions = 'Hashimoto''s Hypothyroidism',
    allergies = '["Penicillin (Rash)"]'::jsonb,
    blood_group = 'A+',
    height_cm = 165,
    weight_kg = 68,
    current_medicines_text = 'Levothyroxine 75mcg'
WHERE id = 'bf387433-b820-48a4-b2ff-799341b5f231';

UPDATE patients 
SET known_conditions = 'Chronic Migraines',
    allergies = '["Sulfa Drugs"]'::jsonb,
    blood_group = 'B-',
    height_cm = 170,
    weight_kg = 65,
    current_medicines_text = 'Topiramate 25mg, Rizatriptan 10mg PRN, Ondansetron 4mg PRN'
WHERE id = '4c2e8a2d-6750-4cb3-862e-64771a4ed939';
