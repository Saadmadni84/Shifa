-- Update Patient Names
UPDATE patients SET first_name = 'Amit', last_name = 'Sharma', name = 'Amit Sharma' WHERE first_name = 'Alex' OR name LIKE '%Alex%';
UPDATE patients SET first_name = 'Hari', last_name = 'Patel', name = 'Hari Patel' WHERE id = '1adc6d4d-c8a3-469e-8bf6-d5729d04829b' OR name LIKE '%Henri%';
UPDATE patients SET first_name = 'Meera', last_name = 'Desai', name = 'Meera Desai' WHERE id = 'bf387433-b820-48a4-b2ff-799341b5f231' OR name LIKE '%Marie%';
UPDATE patients SET first_name = 'Sneha', last_name = 'Kapoor', name = 'Sneha Kapoor' WHERE id = '4c2e8a2d-6750-4cb3-862e-64771a4ed939' OR name LIKE '%Sofia%';

-- Update Doctor Names
UPDATE practitioners SET first_name = 'Dr. Rahul', last_name = 'Gupta', name = 'Dr. Rahul Gupta' WHERE name LIKE '%Nedo%';
UPDATE practitioners SET first_name = 'Dr. Anil', last_name = 'Mehta', name = 'Dr. Anil Mehta' WHERE name LIKE '%Bennett%';
UPDATE practitioners SET first_name = 'Dr. Sanjay', last_name = 'Joshi', name = 'Dr. Sanjay Joshi' WHERE name LIKE '%Vance%';
UPDATE practitioners SET first_name = 'Dr. Rakesh', last_name = 'Verma', name = 'Dr. Rakesh Verma' WHERE name LIKE '%Bashir%';

-- Update JSON transcripts and notes in visits
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Alex Johnson', 'Amit Sharma')::json WHERE raw_notes::text LIKE '%Alex Johnson%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Alex', 'Amit')::json WHERE raw_notes::text LIKE '%Alex%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'DR. NEDO', 'DR. GUPTA')::json WHERE raw_notes::text LIKE '%DR. NEDO%';

UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Henri Lambert', 'Hari Patel')::json WHERE raw_notes::text LIKE '%Henri Lambert%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Henri', 'Hari')::json WHERE raw_notes::text LIKE '%Henri%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Mr. Lambert', 'Mr. Patel')::json WHERE raw_notes::text LIKE '%Mr. Lambert%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'DR. BENNETT', 'DR. MEHTA')::json WHERE raw_notes::text LIKE '%DR. BENNETT%';

UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Marie Dupont', 'Meera Desai')::json WHERE raw_notes::text LIKE '%Marie Dupont%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Marie', 'Meera')::json WHERE raw_notes::text LIKE '%Marie%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Ms. Dupont', 'Ms. Desai')::json WHERE raw_notes::text LIKE '%Ms. Dupont%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'DR. VANCE', 'DR. JOSHI')::json WHERE raw_notes::text LIKE '%DR. VANCE%';

UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Sofia Kowalska', 'Sneha Kapoor')::json WHERE raw_notes::text LIKE '%Sofia Kowalska%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Sofia', 'Sneha')::json WHERE raw_notes::text LIKE '%Sofia%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'Ms. Kowalska', 'Ms. Kapoor')::json WHERE raw_notes::text LIKE '%Ms. Kowalska%';
UPDATE visits SET raw_notes = REPLACE(raw_notes::text, 'DR. BASHIR', 'DR. VERMA')::json WHERE raw_notes::text LIKE '%DR. BASHIR%';

