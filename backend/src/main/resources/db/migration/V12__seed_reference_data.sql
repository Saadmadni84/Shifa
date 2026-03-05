CREATE TABLE icd_reference (
    code        VARCHAR(10) PRIMARY KEY,
    description VARCHAR(300) NOT NULL,
    category    VARCHAR(100)
);

INSERT INTO icd_reference (code, description, category) VALUES
('J06.9', 'Acute upper respiratory infection, unspecified', 'Respiratory'),
('E11',   'Type 2 diabetes mellitus', 'Endocrine'),
('I10',   'Essential (primary) hypertension', 'Cardiovascular'),
('J18.9', 'Pneumonia, unspecified organism', 'Respiratory'),
('A90',   'Dengue fever [classical dengue]', 'Infectious'),
('B54',   'Unspecified malaria', 'Infectious'),
('K29.7', 'Gastritis, unspecified', 'Digestive'),
('A09',   'Other gastroenteritis and colitis', 'Digestive'),
('M54.5', 'Low back pain', 'Musculoskeletal'),
('J45.9', 'Asthma, unspecified', 'Respiratory'),
('N39.0', 'Urinary tract infection, site not specified', 'Urogenital'),
('K35.8', 'Acute appendicitis, other and unspecified', 'Digestive'),
('E78.5', 'Hyperlipidaemia, unspecified', 'Endocrine'),
('I50.9', 'Heart failure, unspecified', 'Cardiovascular'),
('A15',   'Respiratory tuberculosis', 'Infectious'),
('B01.9', 'Varicella without complication (Chickenpox)', 'Infectious'),
('L50.9', 'Urticaria, unspecified (Allergy)', 'Skin'),
('F32.9', 'Major depressive disorder, single episode', 'Mental'),
('G43.9', 'Migraine, unspecified', 'Neurological'),
('E86.0', 'Dehydration', 'Fluid/Electrolyte');
