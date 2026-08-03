
"""
services/document_builder.py

Convert loaded patient data into LangChain Document objects.
"""

from langchain_core.documents import Document


def _value(value):
    return "N/A" if value in (None, "", []) else str(value)


def build_patient_document(patient):
    text = f"""
PATIENT PROFILE

Name: {_value(patient.get("first_name"))} {_value(patient.get("last_name"))}
Phone: {_value(patient.get("phone_number"))}
Email: {_value(patient.get("email"))}
Date of Birth: {_value(patient.get("date_of_birth"))}
Gender: {_value(patient.get("gender"))}
Blood Group: {_value(patient.get("blood_group"))}
Preferred Language: {_value(patient.get("preferred_language"))}
Address: {_value(patient.get("address"))}
City: {_value(patient.get("city"))}
State: {_value(patient.get("state"))}

Known Conditions:
{_value(patient.get("known_conditions"))}

Current Medicines:
{_value(patient.get("current_medicines_text"))}
""".strip()

    return Document(
        page_content=text,
        metadata={
            "type": "patient_profile",
            "patient_id": patient["id"],
            "language": patient.get("preferred_language"),
        }
    )


def build_visit_documents(visits):
    docs = []

    for visit in visits:
        text = f"""
VISIT RECORD

Visit Date: {_value(visit.get("visit_date"))}
Doctor: {_value(visit.get("doctor_name"))}
Specialization: {_value(visit.get("specialization"))}

Chief Complaint:
{_value(visit.get("chief_complaint"))}

Diagnosis:
{_value(visit.get("diagnosis"))}

Clinical Notes:
{_value(visit.get("raw_notes"))}

Follow Up:
{_value(visit.get("follow_up_date"))}
""".strip()

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "type": "visit",
                    "patient_id": visit["patient_id"],
                    "visit_id": visit["id"],
                    "doctor_id": visit.get("doctor_id"),
                    "visit_date": _value(visit.get("visit_date"))
                }
            )
        )

    return docs


def build_prescription_documents(prescriptions):
    docs = []

    for prescription in prescriptions:

        medicines = prescription.get("medications", [])

        medicine_text = ""

        if medicines:
            for i, medicine in enumerate(medicines, 1):
                medicine_text += f"""
Medicine {i}
Name: {_value(medicine.get("name"))}
Generic Name: {_value(medicine.get("generic_name"))}
Dosage: {_value(medicine.get("dosage"))}
Frequency: {_value(medicine.get("frequency"))}
Timing: {_value(medicine.get("timing"))}
Duration: {_value(medicine.get("duration_days"))} days
Instructions: {_value(medicine.get("instructions"))}

"""
        else:
            medicine_text = "No medicines available."

        text = f"""
PRESCRIPTION

Special Instructions:
{_value(prescription.get("special_instructions"))}

Diet Advice:
{_value(prescription.get("diet_advice"))}

Activity Restrictions:
{_value(prescription.get("activity_restrictions"))}

Medicines

{medicine_text}
""".strip()

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "type": "prescription",
                    "patient_id": prescription.get("patient_id"),
                    "visit_id": prescription["visit_id"],
                    "prescription_id": prescription["id"],
                }
            )
        )

    return docs


def build_uploaded_document_documents(documents):
    docs = []

    for document in documents:

        ocr = document.get("ocr_results", [])

        extracted = ""

        if ocr:
            extracted = "\n\n".join(
                item.get("raw_text", "") for item in ocr if item.get("raw_text")
            )

        text = f"""
UPLOADED DOCUMENT

Original File:
{_value(document.get("original_filename"))}

Document Type:
{_value(document.get("document_type"))}

Description:
{_value(document.get("description"))}

OCR CONTENT

{_value(extracted)}
""".strip()

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "type": "uploaded_document",
                    "patient_id": document["patient_id"],
                    "document_id": document["id"],
                    "document_type": document.get("document_type"),
                }
            )
        )

    return docs


def build_summary_documents(summaries):
    docs = []

    for summary in summaries:

        text = f"""
VISIT SUMMARY

Language:
{_value(summary.get("language_code"))}

Summary:

{_value(summary.get("summary_text"))}
""".strip()

        docs.append(
            Document(
                page_content=text,
                metadata={
                    "type": "visit_summary",
                    "patient_id": summary.get("patient_id"),
                    "visit_id": summary["visit_id"],
                    "language": summary.get("language_code"),
                },
            )
        )

    return docs


def build_complete_documents(patient_data):
    documents = []

    patient = patient_data.get("patient")

    if patient:
        documents.append(build_patient_document(patient))

    documents.extend(
        build_visit_documents(patient_data.get("visits", []))
    )

    documents.extend(
        build_prescription_documents(patient_data.get("prescriptions", []))
    )

    documents.extend(
        build_uploaded_document_documents(
            patient_data.get("uploaded_documents", [])
        )
    )

    documents.extend(
        build_summary_documents(
            patient_data.get("visit_summaries", [])
        )
    )

    return documents
