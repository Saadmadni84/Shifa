"""
dummy_data/generate_dummy_pdf.py

Generates a realistic 4-page medical report PDF for testing and demonstration.
Uses reportlab to create a proper PDF with:
- Clinic header and title
- Patient demographics table
- Lab results (CBC, metabolic panel) with tables
- Radiology findings with headings and paragraphs
- Treatment plan with numbered sections
- Follow-up instructions

Usage:
    python dummy_data/generate_dummy_pdf.py
"""

import os
import sys

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, HRFlowable
    )
    from reportlab.lib import colors
except ImportError:
    print("[ERROR] reportlab is required. Install it with: pip install reportlab")
    sys.exit(1)


def generate_dummy_pdf(output_path: str = None):
    """Generates a realistic 4-page medical report PDF."""
    if output_path is None:
        output_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(output_dir, "sample_medical_report.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=18,
        textColor=HexColor("#1a5276"),
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=HexColor("#2c3e50"),
        spaceBefore=16,
        spaceAfter=8,
    )
    subheading_style = ParagraphStyle(
        "SubHeading",
        parent=styles["Heading3"],
        fontSize=12,
        textColor=HexColor("#34495e"),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )

    elements = []

    # =====================================================
    # PAGE 1: Header + Patient Demographics
    # =====================================================
    elements.append(Paragraph("SHIFA MEDICAL CENTER", title_style))
    elements.append(Paragraph(
        "123 Healthcare Boulevard, Mumbai, Maharashtra 400001 | Tel: +91-22-1234-5678",
        ParagraphStyle("Center", parent=body_style, alignment=TA_CENTER, textColor=HexColor("#7f8c8d"))
    ))
    elements.append(HRFlowable(width="100%", thickness=2, color=HexColor("#1a5276")))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("COMPREHENSIVE MEDICAL REPORT", heading_style))
    elements.append(Paragraph("Report ID: SMC-2026-07-28-001 | Date: July 28, 2026", body_style))
    elements.append(Spacer(1, 12))

    # Patient Demographics Table
    elements.append(Paragraph("1. PATIENT DEMOGRAPHICS", heading_style))
    patient_data = [
        ["Field", "Details"],
        ["Patient Name", "Hari Patel"],
        ["Patient ID", "1adc6d4d-c8a3-469e-8bf6-d5729d04829b"],
        ["Date of Birth", "May 14, 1988 (Age: 38)"],
        ["Gender", "Male"],
        ["Blood Group", "O+"],
        ["Contact", "+91-98765-43210"],
        ["Email", "hari.patel@example.com"],
        ["Address", "42 Marine Drive, Flat 7B, Mumbai, Maharashtra 400002"],
        ["Emergency Contact", "Priya Patel (Spouse) - +91-98765-43211"],
        ["Insurance", "Star Health Policy #SH-2025-887654"],
        ["Attending Physician", "Dr. Anika Mehta, MD (Pulmonology)"],
        ["Referring Physician", "Dr. Rajesh Kumar, MBBS (General Medicine)"],
    ]
    patient_table = Table(patient_data, colWidths=[2 * inch, 4.5 * inch])
    patient_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1a5276")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#ecf0f1")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("2. CLINICAL HISTORY", heading_style))
    elements.append(Paragraph(
        "Mr. Hari Patel presented to the Shifa Medical Center outpatient department on July 28, 2026 "
        "with complaints of persistent productive cough for 10 days, low-grade intermittent fever "
        "(max 100.4°F / 38.0°C), mild dyspnea on exertion, and general fatigue. The patient has a "
        "known history of childhood asthma (diagnosed age 7) with occasional wheezing episodes, "
        "currently managed with an Albuterol HFA inhaler as needed. No prior hospitalizations. "
        "Non-smoker. No known drug allergies.",
        body_style
    ))
    elements.append(Paragraph(
        "Previous medications include Montelukast 10mg daily (discontinued 2024) and seasonal "
        "Cetirizine use. Patient reports increased rescue inhaler usage over the past 2 weeks "
        "(4-5 times/day compared to usual 1-2 times/week). Occupational history: software engineer, "
        "works from home. Recent travel to Goa 3 weeks ago.",
        body_style
    ))

    # =====================================================
    # PAGE 2: Vital Signs + Lab Results
    # =====================================================
    elements.append(PageBreak())

    elements.append(Paragraph("3. VITAL SIGNS AT PRESENTATION", heading_style))
    vitals_data = [
        ["Parameter", "Value", "Reference Range", "Status"],
        ["Blood Pressure", "128/82 mmHg", "< 140/90 mmHg", "Normal"],
        ["Heart Rate", "92 bpm", "60-100 bpm", "Normal"],
        ["Respiratory Rate", "22 breaths/min", "12-20 breaths/min", "Slightly Elevated"],
        ["Temperature", "100.2°F (37.9°C)", "97.8-99.1°F", "Low-Grade Fever"],
        ["SpO2", "96%", "> 95%", "Normal"],
        ["Weight", "78 kg", "-", "-"],
        ["Height", "175 cm", "-", "-"],
        ["BMI", "25.5 kg/m²", "18.5-24.9", "Overweight"],
    ]
    vitals_table = Table(vitals_data, colWidths=[1.6 * inch, 1.5 * inch, 1.6 * inch, 1.5 * inch])
    vitals_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1a5276")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#ecf0f1")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(vitals_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("4. LABORATORY RESULTS", heading_style))

    elements.append(Paragraph("4.1 Complete Blood Count (CBC)", subheading_style))
    cbc_data = [
        ["Test", "Result", "Reference Range", "Flag"],
        ["WBC", "12,800 /µL", "4,000 - 11,000", "HIGH ↑"],
        ["RBC", "4.8 million/µL", "4.5 - 5.5", "Normal"],
        ["Hemoglobin", "14.2 g/dL", "13.5 - 17.5", "Normal"],
        ["Hematocrit", "42.1%", "38.3 - 48.6", "Normal"],
        ["Platelets", "245,000 /µL", "150,000 - 400,000", "Normal"],
        ["Neutrophils", "72%", "40 - 70%", "HIGH ↑"],
        ["Lymphocytes", "20%", "20 - 40%", "Normal"],
        ["Eosinophils", "5%", "1 - 4%", "HIGH ↑"],
        ["ESR", "28 mm/hr", "0 - 20", "HIGH ↑"],
    ]
    cbc_table = Table(cbc_data, colWidths=[1.8 * inch, 1.5 * inch, 1.6 * inch, 1.3 * inch])
    cbc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#ecf0f1")]),
        ("TEXTCOLOR", (3, 1), (3, -1), HexColor("#e74c3c")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(cbc_table)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("4.2 Comprehensive Metabolic Panel", subheading_style))
    metabolic_data = [
        ["Test", "Result", "Reference Range", "Flag"],
        ["Glucose (Fasting)", "98 mg/dL", "70 - 100", "Normal"],
        ["BUN", "16 mg/dL", "7 - 20", "Normal"],
        ["Creatinine", "0.9 mg/dL", "0.7 - 1.3", "Normal"],
        ["Sodium", "140 mEq/L", "136 - 145", "Normal"],
        ["Potassium", "4.1 mEq/L", "3.5 - 5.0", "Normal"],
        ["CRP (C-Reactive Protein)", "18.5 mg/L", "< 10.0", "HIGH ↑"],
        ["Procalcitonin", "0.15 ng/mL", "< 0.25", "Normal"],
    ]
    metabolic_table = Table(metabolic_data, colWidths=[2.2 * inch, 1.3 * inch, 1.4 * inch, 1.3 * inch])
    metabolic_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#ecf0f1")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(metabolic_table)

    # =====================================================
    # PAGE 3: Radiology + Diagnosis
    # =====================================================
    elements.append(PageBreak())

    elements.append(Paragraph("5. RADIOLOGY FINDINGS", heading_style))

    elements.append(Paragraph("5.1 Chest X-Ray (PA View)", subheading_style))
    elements.append(Paragraph(
        "A postero-anterior chest radiograph was obtained on July 28, 2026. Findings are as follows:",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Lungs:</b> Bilateral peribronchial cuffing noted, consistent with bronchial wall "
        "thickening. Mild bilateral basal haziness suggesting early bronchopneumonic infiltrates. "
        "No consolidation, cavitation, or effusion.",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Heart:</b> Normal cardiac silhouette. Cardiothoracic ratio within normal limits (0.45).",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Mediastinum:</b> No mediastinal widening or lymphadenopathy.",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Pleura:</b> No pleural effusion or pneumothorax.",
        body_style
    ))
    elements.append(Paragraph(
        "• <b>Impression:</b> Findings consistent with acute bronchitis with possible early "
        "community-acquired pneumonia. Recommend clinical correlation and follow-up imaging "
        "if symptoms persist beyond 7-10 days.",
        body_style
    ))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("5.2 Pulmonary Function Test (PFT) Summary", subheading_style))
    elements.append(Paragraph(
        "Spirometry performed on the same date shows FEV1 of 2.8L (78% predicted), FVC of 3.9L "
        "(89% predicted), and FEV1/FVC ratio of 71.8%. Post-bronchodilator improvement of 15% in "
        "FEV1, confirming reversible airway obstruction consistent with asthma. Peak Expiratory "
        "Flow Rate (PEFR) measured at 380 L/min (72% predicted).",
        body_style
    ))
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("6. CLINICAL ASSESSMENT & DIAGNOSIS", heading_style))
    elements.append(Paragraph("<b>Primary Diagnosis:</b>", body_style))
    elements.append(Paragraph(
        "• Acute Bronchitis (ICD-10: J20.9) with secondary asthma exacerbation",
        body_style
    ))
    elements.append(Paragraph("<b>Secondary Diagnoses:</b>", body_style))
    elements.append(Paragraph(
        "• Mild persistent asthma, currently in acute exacerbation (ICD-10: J45.31)\n"
        "• Possible early community-acquired pneumonia (ICD-10: J18.9) — to be confirmed with "
        "sputum culture results",
        body_style
    ))
    elements.append(Paragraph("<b>Clinical Notes:</b>", body_style))
    elements.append(Paragraph(
        "The clinical presentation, elevated WBC count with neutrophilia and eosinophilia, raised "
        "CRP, and chest X-ray findings are consistent with acute infectious bronchitis superimposed "
        "on underlying asthma. The increased rescue inhaler usage and reduced PFT values indicate "
        "an acute asthma exacerbation. Sputum culture and sensitivity have been ordered to guide "
        "antibiotic therapy.",
        body_style
    ))

    # =====================================================
    # PAGE 4: Treatment Plan + Follow-up
    # =====================================================
    elements.append(PageBreak())

    elements.append(Paragraph("7. TREATMENT PLAN", heading_style))

    elements.append(Paragraph("7.1 Prescribed Medications", subheading_style))
    meds_data = [
        ["#", "Medication", "Dosage", "Frequency", "Duration", "Instructions"],
        ["1", "Amoxicillin", "500 mg", "Three times daily", "7 days", "After meals. Complete full course."],
        ["2", "Azithromycin", "500 mg", "Once daily", "3 days", "Day 1: 500mg, Day 2-3: 250mg. With food."],
        ["3", "Montelukast", "10 mg", "Once daily", "30 days", "At bedtime. Asthma controller."],
        ["4", "Albuterol HFA Inhaler", "2 puffs", "Every 4-6 hours PRN", "30 days", "Rescue inhaler for wheezing."],
        ["5", "Guaifenesin Syrup", "10 mL", "Three times daily", "5 days", "Expectorant for productive cough."],
        ["6", "Paracetamol", "500 mg", "Every 6 hours PRN", "5 days", "For fever > 100°F only."],
    ]
    meds_table = Table(meds_data, colWidths=[0.3 * inch, 1.3 * inch, 0.7 * inch, 1.2 * inch, 0.7 * inch, 2.0 * inch])
    meds_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1a5276")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#ecf0f1")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(meds_table)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("7.2 Lifestyle & Dietary Recommendations", subheading_style))
    elements.append(Paragraph(
        "• Increase fluid intake (warm water, herbal teas) to at least 2.5 liters per day\n"
        "• Avoid cold beverages, ice cream, and refrigerated foods\n"
        "• Light warm diet recommended — soup, dal, steamed vegetables\n"
        "• Complete bed rest for 2-3 days, then gradual return to normal activity\n"
        "• Avoid exposure to dust, smoke, and strong perfumes (asthma triggers)\n"
        "• Use humidifier in bedroom to ease breathing\n"
        "• Practice deep breathing exercises 3 times daily",
        body_style
    ))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("8. FOLLOW-UP INSTRUCTIONS", heading_style))
    elements.append(Paragraph(
        "• <b>Follow-up appointment:</b> August 4, 2026 (7 days from visit)\n"
        "• <b>Sputum culture results:</b> Expected in 3-5 business days. Lab will contact if urgent.\n"
        "• <b>Repeat Chest X-Ray:</b> If symptoms persist after 10 days of treatment\n"
        "• <b>Emergency criteria:</b> Return immediately if experiencing high fever (> 102°F), "
        "severe shortness of breath, chest pain, or blood in sputum\n"
        "• <b>Peak Flow Monitoring:</b> Record PEFR twice daily (morning and evening) and bring "
        "the log to the follow-up visit",
        body_style
    ))
    elements.append(Spacer(1, 20))

    elements.append(HRFlowable(width="100%", thickness=1, color=HexColor("#bdc3c7")))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "<b>Prepared by:</b> Dr. Anika Mehta, MD (Pulmonology) | License: MH-MED-2015-28456",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Reviewed by:</b> Dr. Suresh Iyer, MD (Internal Medicine) | Department Head",
        body_style
    ))
    elements.append(Paragraph(
        "<i>This report is confidential and intended solely for the patient and authorized healthcare providers. "
        "Unauthorized distribution is prohibited under the Information Technology Act, 2000.</i>",
        ParagraphStyle("Disclaimer", parent=body_style, fontSize=8, textColor=HexColor("#95a5a6"))
    ))

    # Build the PDF
    doc.build(elements)
    print(f"[SUCCESS] Generated dummy PDF: {output_path}")
    print(f"[INFO] File size: {os.path.getsize(output_path):,} bytes")
    return output_path


if __name__ == "__main__":
    generate_dummy_pdf()
