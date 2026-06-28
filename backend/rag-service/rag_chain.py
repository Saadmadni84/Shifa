"""
Shifa RAG Service — QA Chain
Retrieval-Augmented Generation chain for patient-specific medical Q&A.
"""
import os
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from vector_store import get_vector_store, build_vector_store
from db_loader import fetch_patient_data, format_patient_documents
from dotenv import load_dotenv

load_dotenv()

# ─── System Prompt ─────────────────────────────────────────────────────────────
SHIFA_SYSTEM_PROMPT = """You are **Shifa**, an AI health assistant for patients at Shifa Healthcare.

ROLE:
- You help patients understand their visit history, diagnosis, medications, and care instructions.
- You speak in a warm, compassionate, and simple tone.
- You answer ONLY based on the provided patient context. Do NOT make up or assume anything.

RULES:
1. Always cite which visit date your answer is based on.
2. Explain medical terms in simple language.
3. For medications, include the dosage, frequency, and purpose.
4. If the patient asks about something not in the context, say: "I don't have information about that in your records. Please consult your doctor."
5. Never provide new medical diagnoses or prescribe medication.
6. If the patient describes emergency symptoms, say: "This sounds urgent. Please call 112 or go to the nearest emergency room immediately."
7. Always end with a caring note.

CONTEXT FROM PATIENT RECORDS:
{context}

PATIENT QUESTION:
{question}

ANSWER (in simple, warm language):"""

PROMPT_TEMPLATE = PromptTemplate(
    template=SHIFA_SYSTEM_PROMPT,
    input_variables=["context", "question"],
)


def get_or_build_vectorstore(patient_id: str):
    """Get existing vector store or build one from database."""
    vectorstore = get_vector_store(patient_id)
    if vectorstore:
        return vectorstore

    # Build from database
    print(f"[RAG] Building vector store for patient {patient_id} from database...")
    patient_data = fetch_patient_data(patient_id)
    if not patient_data:
        print(f"[RAG] No patient data found for {patient_id}")
        return None

    documents = format_patient_documents(patient_data)
    if not documents:
        print(f"[RAG] No documents generated for patient {patient_id}")
        return None

    vectorstore = build_vector_store(documents, patient_id)
    return vectorstore


def create_qa_chain(patient_id: str):
    """
    Create a RetrievalQA chain for a specific patient.
    
    Returns:
        (qa_chain, retriever) tuple, or (None, None) if no data
    """
    vectorstore = get_or_build_vectorstore(patient_id)
    if not vectorstore:
        return None, None

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
    )

    llm = Ollama(model="mistral")

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT_TEMPLATE},
    )

    return qa_chain, retriever


def ask_question(patient_id: str, question: str) -> dict:
    """
    Ask a question about a patient's medical history.
    
    Args:
        patient_id: UUID of the patient
        question: the patient's question
    
    Returns:
        dict with 'answer', 'sources', and 'disclaimer'
    """
    qa_chain, retriever = create_qa_chain(patient_id)

    if not qa_chain:
        return {
            "answer": "I'm sorry, I couldn't find any medical records for this patient. Please make sure the patient has visit history in the system.",
            "sources": [],
            "disclaimer": "⚠️ This is AI-generated information, not medical advice. Always consult your healthcare provider.",
        }

    try:
        result = qa_chain.invoke({"query": question})

        # Extract source document metadata
        sources = []
        if result.get("source_documents"):
            seen = set()
            for doc in result["source_documents"]:
                meta = doc.metadata
                source_key = f"{meta.get('doc_type', '')}_{meta.get('visit_date', '')}"
                if source_key not in seen:
                    seen.add(source_key)
                    sources.append(
                        {
                            "type": meta.get("doc_type", "unknown"),
                            "visit_date": meta.get("visit_date", ""),
                            "doctor_name": meta.get("doctor_name", ""),
                        }
                    )

        return {
            "answer": result["result"],
            "sources": sources,
            "disclaimer": "⚠️ This is AI-generated information based on your medical records, not medical advice. Always consult your healthcare provider for medical decisions.",
        }

    except Exception as e:
        print(f"[RAG] Error answering question: {e}")
        return {
            "answer": "I'm sorry, I encountered an error while processing your question. Please try again.",
            "sources": [],
            "disclaimer": "⚠️ This is not medical advice.",
            "error": str(e),
        }


def refresh_patient_data(patient_id: str) -> bool:
    """
    Refresh the vector store for a patient by re-fetching data from the database.
    Call this after new visits are added.
    
    Returns:
        True if successful, False otherwise
    """
    try:
        from vector_store import delete_patient_store

        # Delete existing
        delete_patient_store(patient_id)

        # Rebuild
        patient_data = fetch_patient_data(patient_id)
        if not patient_data:
            return False

        documents = format_patient_documents(patient_data)
        if not documents:
            return False

        build_vector_store(documents, patient_id)
        return True

    except Exception as e:
        print(f"[RAG] Error refreshing patient data: {e}")
        return False
