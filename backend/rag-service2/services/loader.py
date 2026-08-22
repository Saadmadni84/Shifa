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
    WHERE (id::text = %s OR user_id::text = %s) AND deleted = FALSE;
    """
    rows = execute_query(query, (str(patient_id), str(patient_id)))
    return rows[0] if rows else None


def build_patient_context_string(patient_data: dict) -> str:
    """Formats structured patient database records into a clean, comprehensive text block for RAG."""
    if not patient_data or not patient_data.get("patient"):
        return "NO PATIENT RECORD FOUND"

    p = patient_data["patient"]
    first_name = p.get("first_name", "") or ""
    last_name = p.get("last_name", "") or ""
    full_name = f"{first_name} {last_name}".strip() or "Patient"
    phone = p.get("phone_number") or "Not set"
    email = p.get("email") or "Not set"
    dob = str(p.get("date_of_birth")) if p.get("date_of_birth") else "Not set"
    gender = p.get("gender") or "Not set"
    blood_group = p.get("blood_group") or "Not set"
    language = p.get("preferred_language") or "English"
    address = p.get("address") or ""
    city = p.get("city") or ""
    state = p.get("state") or ""
    full_address = ", ".join(filter(None, [address, city, state])) or "Not set"
    known_conditions = p.get("known_conditions") or "None recorded"
    current_medicines = p.get("current_medicines_text") or "None recorded"

    profile_text = (
        f"PATIENT PROFILE:\n"
        f"- Full Name: {full_name}\n"
        f"- First Name: {first_name}\n"
        f"- Last Name: {last_name}\n"
        f"- MRN / ID: MRN-{str(p.get('id', ''))[:8].upper()}\n"
        f"- Phone: {phone}\n"
        f"- Email: {email}\n"
        f"- Date of Birth: {dob}\n"
        f"- Gender: {gender}\n"
        f"- Blood Group: {blood_group}\n"
        f"- Preferred Language: {language}\n"
        f"- Address: {full_address}\n"
        f"- Known Conditions: {known_conditions}\n"
        f"- Current Medications: {current_medicines}"
    )

    allergies = patient_data.get("allergies", [])
    if allergies:
        allergy_items = [a.get("allergy") for a in allergies if a.get("allergy")]
        allergies_text = "ALLERGIES:\n" + ("\n".join(f"- {a}" for a in allergy_items) if allergy_items else "- None recorded")
    else:
        allergies_text = "ALLERGIES:\n- None recorded"

    chronic = patient_data.get("chronic_conditions", [])
    if chronic:
        cond_items = [c.get("condition_name") for c in chronic if c.get("condition_name")]
        conditions_text = "CHRONIC CONDITIONS & DIAGNOSES:\n" + ("\n".join(f"- {c}" for c in cond_items) if cond_items else "- None recorded")
    else:
        conditions_text = "CHRONIC CONDITIONS & DIAGNOSES:\n- None recorded"

    vitals = patient_data.get("vital_signs", [])
    if vitals:
        v_lines = []
        for v in vitals[:3]:
            bp = v.get("blood_pressure") or "N/A"
            hr = v.get("heart_rate") or "N/A"
            recorded_at = str(v.get("recorded_at", ""))[:10]
            v_lines.append(f"- Recorded {recorded_at}: BP {bp}, Heart Rate {hr} bpm")
        vitals_text = "VITAL SIGNS:\n" + "\n".join(v_lines)
    else:
        vitals_text = "VITAL SIGNS:\n- No vitals recorded yet"

    visits = patient_data.get("visits", [])
    if visits:
        v_items = []
        for v in visits[:5]:
            v_date = str(v.get("visit_date", ""))
            doc_name = v.get("doctor_name") or "Doctor"
            spec = v.get("specialization") or "General"
            complaint = v.get("chief_complaint") or "N/A"
            diag = v.get("diagnosis") or "N/A"
            notes = v.get("raw_notes") or ""
            v_items.append(f"- Visit Date: {v_date} | Doctor: {doc_name} ({spec}) | Chief Complaint: {complaint} | Diagnosis: {diag}" + (f" | Notes: {notes}" if notes else ""))
        visits_text = f"VISIT HISTORY ({len(visits)} visit(s) recorded):\n" + "\n".join(v_items)
    else:
        visits_text = "VISIT HISTORY:\n- No visits recorded yet"

    prescriptions = patient_data.get("prescriptions", [])
    if prescriptions:
        rx_items = []
        for rx in prescriptions:
            meds = rx.get("medications", [])
            for m in meds:
                med_name = m.get("name") or m.get("generic_name") or "Medication"
                dosage = m.get("dosage") or ""
                freq = m.get("frequency") or ""
                timing = m.get("timing") or ""
                dur = m.get("duration_days")
                instructions = m.get("instructions") or ""
                rx_items.append(f"- {med_name} {dosage} ({freq}, {timing})" + (f" for {dur} days" if dur else "") + (f". {instructions}" if instructions else ""))
        prescriptions_text = "PRESCRIPTIONS & MEDICATIONS:\n" + ("\n".join(rx_items) if rx_items else "- No active medications listed")
    else:
        prescriptions_text = "PRESCRIPTIONS & MEDICATIONS:\n- No active prescriptions recorded"

    docs = patient_data.get("uploaded_documents", [])
    if docs:
        d_items = [f"- {d.get('original_filename', 'Document')} ({d.get('document_type', 'OTHER')})" for d in docs[:5]]
        docs_text = f"UPLOADED DOCUMENTS ({len(docs)} file(s)):\n" + "\n".join(d_items)
    else:
        docs_text = "UPLOADED DOCUMENTS:\n- No documents uploaded yet"

    return "\n\n".join([
        profile_text,
        allergies_text,
        conditions_text,
        vitals_text,
        visits_text,
        prescriptions_text,
        docs_text
    ])


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
        logger.warning(f"Patient '{patient_id}' not found in DB; no patient context will be created.")
        return {}

    visits = get_visits(patient_id)
    try:
        prescriptions = get_prescriptions(patient_id)
    except Exception as e:
        logger.warning(f"Optional prescription context unavailable for patient '{patient_id}': {e}")
        prescriptions = []

    for prescription in prescriptions:
        prescription["patient_id"] = patient_id
        try:
            medications = get_medications(prescription["id"])
        except Exception as e:
            logger.warning(f"Optional medication context unavailable for patient '{patient_id}': {e}")
            medications = []
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

    try:
        visit_summaries = get_visit_summaries(patient_id)
    except Exception as e:
        logger.warning(f"Optional visit summary context unavailable for patient '{patient_id}': {e}")
        visit_summaries = []
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