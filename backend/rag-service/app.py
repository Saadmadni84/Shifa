"""
Shifa RAG Service — Flask REST API
Exposes endpoints for the Shifa frontend/backend to interact with RAG.

Endpoints:
  POST /api/rag/chat           — Ask a question about a patient
  POST /api/rag/index          — Index/refresh a patient's data
  GET  /api/rag/health         — Health check
  POST /api/rag/index-all      — Index all patients (admin)
"""
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ─── Health Check ──────────────────────────────────────────────────────────────
@app.route("/api/rag/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "shifa-rag",
        "version": "1.0.0",
    })


# ─── Chat Endpoint ─────────────────────────────────────────────────────────────
@app.route("/api/rag/chat", methods=["POST"])
def chat():
    """
    Ask a question about a patient's medical history.
    
    Request body:
    {
        "patientId": "uuid-string",
        "question": "What are my medications?",
        "language": "en"  (optional)
    }
    
    Response:
    {
        "answer": "Based on your visit from ...",
        "sources": [...],
        "disclaimer": "..."
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    patient_id = data.get("patientId")
    question = data.get("question")
    language = data.get("language", "en")

    if not patient_id:
        return jsonify({"error": "patientId is required"}), 400
    if not question:
        return jsonify({"error": "question is required"}), 400

    # Add language preference to the question if not English
    if language and language != "en":
        question = f"[Please respond in {language}] {question}"

    from rag_chain import ask_question
    result = ask_question(patient_id, question)

    return jsonify(result)


# ─── Index Patient Data ────────────────────────────────────────────────────────
@app.route("/api/rag/index", methods=["POST"])
def index_patient():
    """
    Index or refresh a patient's data in the vector store.
    
    Request body:
    {
        "patientId": "uuid-string"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    patient_id = data.get("patientId")
    if not patient_id:
        return jsonify({"error": "patientId is required"}), 400

    from rag_chain import refresh_patient_data
    success = refresh_patient_data(patient_id)

    if success:
        return jsonify({
            "status": "success",
            "message": f"Patient {patient_id} data indexed successfully",
        })
    else:
        return jsonify({
            "status": "failed",
            "message": f"Failed to index patient {patient_id}. Check if patient exists.",
        }), 404


# ─── Index All Patients ────────────────────────────────────────────────────────
@app.route("/api/rag/index-all", methods=["POST"])
def index_all():
    """Index all patients in the database. Used for initial setup."""
    from db_loader import fetch_all_patient_ids
    from rag_chain import refresh_patient_data

    patient_ids = fetch_all_patient_ids()
    results = {"total": len(patient_ids), "success": 0, "failed": 0, "errors": []}

    for pid in patient_ids:
        try:
            if refresh_patient_data(pid):
                results["success"] += 1
            else:
                results["failed"] += 1
                results["errors"].append(f"No data for {pid}")
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(f"{pid}: {str(e)}")

    return jsonify(results)


# ─── Chat with Visit Context (for portal) ─────────────────────────────────────
@app.route("/api/rag/visit-chat", methods=["POST"])
def visit_chat():
    """
    Chat about a specific visit context. Used by the patient portal.
    
    Request body:
    {
        "patientId": "uuid-string",
        "visitId": "uuid-string",
        "question": "What does my diagnosis mean?",
        "context": "optional initial context string"
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    patient_id = data.get("patientId")
    question = data.get("question")
    visit_id = data.get("visitId")
    context = data.get("context", "")

    if not patient_id:
        return jsonify({"error": "patientId is required"}), 400
    if not question:
        return jsonify({"error": "question is required"}), 400

    # Enhance question with visit context
    enhanced_question = question
    if visit_id:
        enhanced_question = f"Regarding my visit (ID: {visit_id}): {question}"
    if context:
        enhanced_question = f"[Context: {context}] {enhanced_question}"

    from rag_chain import ask_question
    result = ask_question(patient_id, enhanced_question)

    return jsonify(result)


# ─── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("RAG_PORT", 5050))
    
    print(f"""
╔══════════════════════════════════════════════════╗
║          🏥 Shifa RAG Service v1.0.0            ║
║                                                  ║
║  Endpoints:                                      ║
║    POST /api/rag/chat        — Patient Q&A       ║
║    POST /api/rag/visit-chat  — Visit-specific    ║
║    POST /api/rag/index       — Index patient     ║
║    POST /api/rag/index-all   — Index all         ║
║    GET  /api/rag/health      — Health check      ║
║                                                  ║
║  Port: {port}                                    ║
╚══════════════════════════════════════════════════╝
    """)
    
    app.run(
        host="0.0.0.0",
        port=port,
        debug=True,
    )
