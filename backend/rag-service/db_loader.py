"""
Shifa RAG Service — Database Loader
Fetches patient visit data from PostgreSQL and structures it for RAG ingestion.
"""
import psycopg2
import psycopg2.extras
import os
import json
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    """Create a connection to the Shifa PostgreSQL database."""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "shifa"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


def fetch_patient_data(patient_id: str) -> dict:
    """Fetch complete patient profile and history for a given patient ID."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # 1) Patient demographics
        cur.execute(
            """
            SELECT id, first_name, last_name, phone_number, email,
                   date_of_birth, gender, blood_group,
                   known_conditions, current_medicines_text,
                   city, state
            FROM patients
            WHERE id = %s
            """,
            (patient_id,),
        )
        patient = cur.fetchone()
        if not patient:
            return None

        # 2) Patient allergies
        cur.execute(
            """
            SELECT allergy FROM patient_allergies WHERE patient_id = %s
            """,
            (patient_id,),
        )
        allergies = [row["allergy"] for row in cur.fetchall()]

        # 3) Chronic conditions
        cur.execute(
            """
            SELECT condition_name FROM patient_chronic_conditions WHERE patient_id = %s
            """,
            (patient_id,),
        )
        chronic_conditions = [row["condition_name"] for row in cur.fetchall()]

        # 4) All visits with doctor info
        cur.execute(
            """
            SELECT v.id as visit_id, v.visit_date, v.visit_type,
                   v.chief_complaint, v.diagnosis, v.raw_notes,
                   v.ai_summary, v.follow_up_date, v.follow_up_notes,
                   v.status,
                   d.first_name as doctor_first_name,
                   d.last_name as doctor_last_name,
                   d.specialization as doctor_specialization
            FROM visits v
            LEFT JOIN doctors d ON v.doctor_id = d.id
            WHERE v.patient_id = %s AND v.deleted = false
            ORDER BY v.visit_date DESC
            """,
            (patient_id,),
        )
        visits = cur.fetchall()

        # 5) Prescriptions & medications for each visit
        visit_prescriptions = {}
        for visit in visits:
            cur.execute(
                """
                SELECT p.id as prescription_id,
                       p.special_instructions, p.diet_advice,
                       p.activity_restrictions
                FROM prescriptions p
                WHERE p.visit_id = %s
                """,
                (str(visit["visit_id"]),),
            )
            prescription = cur.fetchone()

            if prescription:
                cur.execute(
                    """
                    SELECT name, generic_name, dosage, frequency,
                           timing, duration_days, route, purpose,
                           side_effects, is_critical
                    FROM medications
                    WHERE prescription_id = %s
                    ORDER BY sort_order
                    """,
                    (str(prescription["prescription_id"]),),
                )
                meds = cur.fetchall()
                visit_prescriptions[str(visit["visit_id"])] = {
                    "prescription": prescription,
                    "medications": meds,
                }

        # 6) Vital signs history
        cur.execute(
            """
            SELECT vs.visit_id, vs.blood_pressure_systolic,
                   vs.blood_pressure_diastolic, vs.heart_rate,
                   vs.temperature, vs.respiratory_rate,
                   vs.oxygen_saturation, vs.weight, vs.height,
                   vs.bmi, vs.recorded_at
            FROM vital_signs vs
            JOIN visits v ON vs.visit_id = v.id
            WHERE v.patient_id = %s AND v.deleted = false
            ORDER BY vs.recorded_at DESC
            """,
            (patient_id,),
        )
        vitals = cur.fetchall()

        return {
            "patient": dict(patient),
            "allergies": allergies,
            "chronic_conditions": chronic_conditions,
            "visits": [dict(v) for v in visits],
            "prescriptions": visit_prescriptions,
            "vitals": [dict(v) for v in vitals],
        }
    finally:
        cur.close()
        conn.close()


def fetch_all_patient_ids() -> list:
    """Fetch all patient IDs for batch processing."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM patients ORDER BY created_at DESC")
        return [str(row[0]) for row in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def format_patient_documents(patient_data: dict) -> list:
    """
    Convert raw patient data into structured text documents
    suitable for chunking and embedding.
    Returns a list of (text, metadata) tuples.
    """
    if not patient_data:
        return []

    documents = []
    patient = patient_data["patient"]
    patient_id = str(patient["id"])
    patient_name = f"{patient['first_name']} {patient['last_name']}"

    # --- Document 1: Patient Profile ---
    profile_text = f"""PATIENT PROFILE
Name: {patient_name}
Date of Birth: {patient.get('date_of_birth', 'Unknown')}
Gender: {patient.get('gender', 'Unknown')}
Blood Group: {patient.get('blood_group', 'Unknown')}
Location: {patient.get('city', '')}, {patient.get('state', '')}
Phone: {patient.get('phone_number', 'N/A')}
Email: {patient.get('email', 'N/A')}

Known Conditions: {patient.get('known_conditions', 'None')}
Current Medicines: {patient.get('current_medicines_text', 'None')}
Allergies: {', '.join(patient_data['allergies']) if patient_data['allergies'] else 'None reported'}
Chronic Conditions: {', '.join(patient_data['chronic_conditions']) if patient_data['chronic_conditions'] else 'None reported'}
"""
    documents.append(
        (
            profile_text,
            {
                "patient_id": patient_id,
                "doc_type": "patient_profile",
                "patient_name": patient_name,
            },
        )
    )

    # --- Document 2+: Per-visit documents ---
    for visit in patient_data["visits"]:
        visit_id = str(visit["visit_id"])
        doctor_name = f"Dr. {visit.get('doctor_first_name', '')} {visit.get('doctor_last_name', '')}".strip()

        # Parse AI summary if it's JSON
        ai_summary_text = ""
        ai_summary_raw = visit.get("ai_summary")
        if ai_summary_raw:
            if isinstance(ai_summary_raw, str):
                try:
                    ai_summary = json.loads(ai_summary_raw)
                except json.JSONDecodeError:
                    ai_summary = None
                    ai_summary_text = ai_summary_raw
            elif isinstance(ai_summary_raw, dict):
                ai_summary = ai_summary_raw
            else:
                ai_summary = None

            if ai_summary and isinstance(ai_summary, dict):
                parts = []
                if ai_summary.get("diagnosis"):
                    parts.append(f"Diagnosis: {ai_summary['diagnosis']}")
                if ai_summary.get("diagnosisDetails"):
                    parts.append(f"Details: {ai_summary['diagnosisDetails']}")
                if ai_summary.get("medications"):
                    med_lines = []
                    for med in ai_summary["medications"]:
                        med_name = med.get("name", "Unknown")
                        med_dosage = med.get("dosage", "")
                        med_freq = med.get("frequency", "")
                        med_purpose = med.get("purpose", "")
                        med_side = ", ".join(med.get("sideEffectsToWatch", []))
                        line = f"  - {med_name} {med_dosage} {med_freq}"
                        if med_purpose:
                            line += f" (for: {med_purpose})"
                        if med_side:
                            line += f" [Side effects: {med_side}]"
                        med_lines.append(line)
                    parts.append("Medications:\n" + "\n".join(med_lines))
                if ai_summary.get("dietaryAdvice"):
                    parts.append(
                        "Dietary Advice: "
                        + "; ".join(ai_summary["dietaryAdvice"])
                    )
                if ai_summary.get("redFlags"):
                    parts.append(
                        "Red Flags (Warning Signs): "
                        + "; ".join(ai_summary["redFlags"])
                    )
                if ai_summary.get("testsOrdered"):
                    parts.append(
                        "Tests Ordered: "
                        + "; ".join(ai_summary["testsOrdered"])
                    )
                if ai_summary.get("doctorInstructions"):
                    parts.append(
                        f"Doctor Instructions: {ai_summary['doctorInstructions']}"
                    )
                if ai_summary.get("followUpInDays"):
                    parts.append(
                        f"Follow-up: in {ai_summary['followUpInDays']} days"
                    )
                ai_summary_text = "\n".join(parts)

        visit_text = f"""VISIT RECORD — {visit.get('visit_date', 'Unknown Date')}
Patient: {patient_name}
Doctor: {doctor_name} ({visit.get('doctor_specialization', 'General')})
Visit Type: {visit.get('visit_type', 'office_visit')}
Status: {visit.get('status', 'Unknown')}

Chief Complaint: {visit.get('chief_complaint', 'Not recorded')}
Diagnosis: {visit.get('diagnosis', 'Not recorded')}

Clinical Notes:
{visit.get('raw_notes', 'No notes recorded')}

AI Summary:
{ai_summary_text if ai_summary_text else 'Not available'}

Follow-up Date: {visit.get('follow_up_date', 'Not scheduled')}
Follow-up Notes: {visit.get('follow_up_notes', 'None')}
"""

        # Add prescription details if available
        prescription_info = patient_data["prescriptions"].get(visit_id)
        if prescription_info:
            presc = prescription_info["prescription"]
            meds = prescription_info["medications"]

            visit_text += f"""
Prescription:
  Special Instructions: {presc.get('special_instructions', 'None')}
  Diet Advice: {presc.get('diet_advice', 'None')}
  Activity Restrictions: {presc.get('activity_restrictions', 'None')}
"""
            if meds:
                visit_text += "  Medications Prescribed:\n"
                for med in meds:
                    visit_text += f"""    - {med.get('name', 'Unknown')} ({med.get('generic_name', '')})
      Dosage: {med.get('dosage', 'N/A')}, Frequency: {med.get('frequency', 'N/A')}
      Timing: {med.get('timing', 'N/A')}, Duration: {med.get('duration_days', 'N/A')} days
      Route: {med.get('route', 'ORAL')}, Purpose: {med.get('purpose', 'N/A')}
      Critical: {'Yes' if med.get('is_critical') else 'No'}
"""

        documents.append(
            (
                visit_text,
                {
                    "patient_id": patient_id,
                    "visit_id": visit_id,
                    "doc_type": "visit_record",
                    "visit_date": str(visit.get("visit_date", "")),
                    "doctor_name": doctor_name,
                    "patient_name": patient_name,
                },
            )
        )

    # --- Document: Vitals History ---
    if patient_data["vitals"]:
        vitals_lines = [f"VITALS HISTORY for {patient_name}\n"]
        for v in patient_data["vitals"]:
            vitals_lines.append(
                f"Date: {v.get('recorded_at', 'Unknown')} | "
                f"BP: {v.get('blood_pressure_systolic', '?')}/{v.get('blood_pressure_diastolic', '?')} mmHg | "
                f"HR: {v.get('heart_rate', '?')} bpm | "
                f"Temp: {v.get('temperature', '?')}°F | "
                f"SpO2: {v.get('oxygen_saturation', '?')}% | "
                f"Weight: {v.get('weight', '?')} kg | "
                f"BMI: {v.get('bmi', '?')}"
            )
        documents.append(
            (
                "\n".join(vitals_lines),
                {
                    "patient_id": patient_id,
                    "doc_type": "vitals_history",
                    "patient_name": patient_name,
                },
            )
        )

    return documents
