"""
services/prompt_builder.py

Builds structured, anti-hallucination prompts for Gemini (Task 3).
"""

from typing import List
from langchain_core.documents import Document


class PromptBuilder:
    """Constructs medical prompts with strict safety rules and fallback directives."""

    SYSTEM_PROMPT = """You are Shifa AI, an expert clinical assistant. Your duty is to provide accurate, safe, and helpful medical guidance based ONLY on the provided patient records and conversation history.

STRICT RULES:
1. Answer ONLY using the provided patient context and conversation history.
2. Never invent, infer beyond evidence, assume, or hallucinate medical information.
3. If the requested information is not present in the patient context or history, reply EXACTLY:
"I couldn't find that information in the patient's records."
4. Be medically precise, clear, and empathetic.
5. Format dosages, medications, visit dates, and diagnoses clearly in bullet points or structured text when appropriate."""

    def build(
        self,
        question: str,
        documents: List[Document],
        conversation_history: str = ""
    ) -> str:
        """
        Builds the complete formatted prompt string.
        """
        if documents:
            context_blocks = []
            for idx, doc in enumerate(documents, 1):
                doc_type = doc.metadata.get("type", "medical_record").upper()
                context_blocks.append(f"--- DOCUMENT {idx} [{doc_type}] ---\n{doc.page_content.strip()}")
            context_str = "\n\n".join(context_blocks)
        else:
            context_str = "No specific medical documents retrieved."

        history_str = conversation_history.strip() if conversation_history.strip() else "No prior conversation history."

        prompt = f"""{self.SYSTEM_PROMPT}

==================================================
CONVERSATION HISTORY
==================================================
{history_str}

==================================================
RETRIEVED PATIENT CONTEXT
==================================================
{context_str}

==================================================
CURRENT QUESTION
==================================================
{question.strip()}

==================================================
STRICT ANSWER INSTRUCTIONS
==================================================
Provide a helpful, precise answer based strictly on the context above. If the information is missing, return: "I couldn't find that information in the patient's records."
"""
        return prompt