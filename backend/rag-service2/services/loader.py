"""
services/loader.py

Database loader for the Shifa RAG pipeline with demo patient fallback.
"""

from db.postgres import execute_query
from common.logging import logger


def get_patients():
    query = """
    SELECT
        id, user_id, first_name, last_name, phone_number, email,
        date_of_birth, gender, blood_group, preferred_language,
        address, city, state, known_conditions, current_medicines_text
    FROM patients
    WHERE deleted = FALSE
    ORDER BY first_name;
    """
    return execute_query(query)


def get_patient(patient_id):
    query = """
    SELECT
        id, user_id, first_name, last_name, phone_number, email,
        date_of_birth, gender, blood_group, preferred_language,
        address, city, state, known_conditions, current_medicines_text
    FROM patients
    WHERE id=%s AND deleted=FALSE;
    """
    rows = execute_query(query, (patient_id,))
    return rows[0] if rows else None


def get_visits(patient_id):
    query = """
    SELECT
        v.id, v.patient_id, v.doctor_id,
        d.first_name || ' ' || d.last_name AS doctor_name,
        d.specialization, v.visit_date, v.chief_complaint,
        v.raw_notes, v.diagnosis, v.follow_up_date, v.status, v.source
    FROM visits v
    LEFT JOIN doctors d ON v.doctor_id=d.id
    WHERE v.patient_id=%s AND v.deleted=FALSE
    ORDER BY v.visit_date DESC;
    """
    return execute_query(query, (patient_id,))


def get_prescriptions(patient_id):
    query = """
    SELECT p.* FROM prescriptions p
    JOIN visits v ON p.visit_id=v.id
    WHERE v.patient_id=%s AND p.deleted=FALSE AND v.deleted=FALSE
    ORDER BY v.visit_date DESC;
    """
    return execute_query(query, (patient_id,))


def get_medications(prescription_id):
    query = """
    SELECT * FROM medications
    WHERE prescription_id=%s AND deleted=FALSE
    ORDER BY sort_order;
    """
    return execute_query(query, (prescription_id,))


def get_uploaded_documents(patient_id):
    query = """
    SELECT * FROM uploaded_documents
    WHERE patient_id=%s AND deleted=FALSE
    ORDER BY created_at DESC;
    """
    return execute_query(query, (patient_id,))


def get_ocr_results(document_id):
    query = """
    SELECT * FROM ocr_results WHERE document_id=%s;
    """
    return execute_query(query, (document_id,))


def get_vital_signs(patient_id):
    query = """
    SELECT vs.* FROM vital_signs vs
    JOIN visits v ON vs.visit_id=v.id
    WHERE v.patient_id=%s
    ORDER BY vs.recorded_at DESC;
    """
    return execute_query(query, (patient_id,))


def get_allergies(patient_id):
    return execute_query(
        "SELECT allergy FROM patient_allergies WHERE patient_id=%s;",
        (patient_id,)
    )


def get_chronic_conditions(patient_id):
    return execute_query(
        "SELECT condition_name FROM patient_chronic_conditions WHERE patient_id=%s;",
        (patient_id,)
    )


def get_visit_summaries(patient_id):
    query = """
    SELECT s.* FROM visit_patient_summaries s
    JOIN visits v ON s.visit_id=v.id
    WHERE v.patient_id=%s
    ORDER BY s.generated_at DESC;
    """
    return execute_query(query, (patient_id,))


def load_complete_patient(patient_id):
    patient = get_patient(patient_id)

    if not patient:
        logger.info(f"Patient '{patient_id}' not found in DB. Returning demo patient profile.")
        patient = {
            "id": patient_id,
            "first_name": "Hari",
            "last_name": "Patel",
            "phone_number": "+1-555-0192",
            "email": "hari.patel@example.com",
            "date_of_birth": "1988-05-14",
            "gender": "Male",
            "blood_group": "O+",
            "preferred_language": "English",
            "address": "123 Healthcare Way",
            "city": "Mumbai",
            "state": "Maharashtra",
            "known_conditions": "Childhood Asthma, Acute Bronchitis",
            "current_medicines_text": "Amoxicillin 500mg, Albuterol HFA inhaler PRN"
        }
        visits = [{
            "id": "demo-visit-001",
            "patient_id": patient_id,
            "doctor_name": "Dr. Mehta",
            "specialization": "General Pulmonology",
            "visit_date": "2026-03-01",
            "chief_complaint": "Persistent cough and low grade fever for 3 days",
            "diagnosis": "Acute Bronchitis with mild asthma exacerbation",
            "raw_notes": "Patient presents with productive cough and mild dyspnea. Prescribed Amoxicillin 500mg TID and Albuterol inhaler.",
            "follow_up_date": "2026-03-08"
        }]
        prescriptions = [{
            "id": "demo-rx-001",
            "patient_id": patient_id,
            "visit_id": "demo-visit-001",
            "special_instructions": "Take medication after meals. Drink plenty of water.",
            "diet_advice": "Light warm fluids, avoid cold beverages.",
            "medications": [
                {
                    "name": "Amoxicillin",
                    "generic_name": "Amoxicillin",
                    "dosage": "500 mg",
                    "frequency": "Three times daily",
                    "timing": "After meals",
                    "duration_days": 7,
                    "instructions": "Complete full course"
                },
                {
                    "name": "Albuterol HFA",
                    "generic_name": "Albuterol",
                    "dosage": "2 puffs",
                    "frequency": "Every 4-6 hours PRN",
                    "timing": "As needed",
                    "duration_days": 30,
                    "instructions": "Inhale deeply for shortness of breath"
                }
            ]
        }]
        return {
            "patient": patient,
            "visits": visits,
            "prescriptions": prescriptions,
            "uploaded_documents": [],
            "vital_signs": [{"blood_pressure": "120/78", "heart_rate": 88}],
            "allergies": [{"allergy": "None known"}],
            "chronic_conditions": [{"condition_name": "Asthma"}],
            "visit_summaries": []
        }

    visits = get_visits(patient_id)
    prescriptions = get_prescriptions(patient_id)

    for prescription in prescriptions:
        prescription["patient_id"] = patient_id
        medications = get_medications(prescription["id"])
        for medicine in medications:
            medicine["patient_id"] = patient_id
            medicine["prescription_id"] = prescription["id"]
        prescription["medications"] = medications

    documents = get_uploaded_documents(patient_id)
    for document in documents:
        ocr_results = get_ocr_results(document["id"])
        for ocr in ocr_results:
            ocr["patient_id"] = patient_id
        document["ocr_results"] = ocr_results

    visit_summaries = get_visit_summaries(patient_id)
    for summary in visit_summaries:
        summary["patient_id"] = patient_id

    return {
        "patient": patient,
        "visits": visits,
        "prescriptions": prescriptions,
        "uploaded_documents": documents,
        "vital_signs": get_vital_signs(patient_id),
        "allergies": get_allergies(patient_id),
        "chronic_conditions": get_chronic_conditions(patient_id),
        "visit_summaries": visit_summaries,
    }