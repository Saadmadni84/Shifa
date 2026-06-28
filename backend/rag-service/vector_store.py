"""
Shifa RAG Service — Vector Store Manager
Handles chunking, embedding, and retrieval using LangChain + ChromaDB.
"""
import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")


def get_embeddings():
    """Initialize HuggingFace embeddings."""
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )


def get_text_splitter():
    """Create a text splitter optimized for medical documents."""
    return RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        length_function=len,
        separators=["\n\n", "\n", ". ", ", ", " "],
    )


def build_vector_store(documents_with_metadata: list, patient_id: str):
    """
    Build or update a ChromaDB vector store for a specific patient.
    
    Args:
        documents_with_metadata: list of (text, metadata) tuples
        patient_id: the patient UUID for collection naming
    
    Returns:
        Chroma vector store instance
    """
    embeddings = get_embeddings()
    text_splitter = get_text_splitter()

    # Convert to LangChain Documents
    langchain_docs = []
    for text, metadata in documents_with_metadata:
        langchain_docs.append(Document(page_content=text, metadata=metadata))

    # Split documents into chunks
    chunks = text_splitter.split_documents(langchain_docs)

    print(f"[RAG] Created {len(chunks)} chunks for patient {patient_id}")

    # Create/update the vector store with patient-specific collection
    collection_name = f"patient_{patient_id.replace('-', '_')[:50]}"

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=CHROMA_PERSIST_DIR,
    )

    print(f"[RAG] Vector store built for patient {patient_id}")
    return vectorstore


def get_vector_store(patient_id: str):
    """
    Load an existing vector store for a patient.
    Returns None if it doesn't exist.
    """
    embeddings = get_embeddings()
    collection_name = f"patient_{patient_id.replace('-', '_')[:50]}"

    try:
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )
        # Check if collection actually has data
        count = vectorstore._collection.count()
        if count == 0:
            return None
        print(f"[RAG] Loaded existing vector store for patient {patient_id} ({count} chunks)")
        return vectorstore
    except Exception as e:
        print(f"[RAG] No existing vector store for patient {patient_id}: {e}")
        return None


def delete_patient_store(patient_id: str):
    """Delete a patient's vector store collection."""
    import chromadb

    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection_name = f"patient_{patient_id.replace('-', '_')[:50]}"
    try:
        client.delete_collection(collection_name)
        print(f"[RAG] Deleted collection {collection_name}")
    except Exception as e:
        print(f"[RAG] Could not delete collection {collection_name}: {e}")


def similarity_search(patient_id: str, query: str, k: int = 4):
    """
    Search the vector store for relevant chunks.
    
    Args:
        patient_id: the patient to search for
        query: the search query
        k: number of results to return
    
    Returns:
        list of (Document, score) tuples
    """
    vectorstore = get_vector_store(patient_id)
    if not vectorstore:
        return []

    results = vectorstore.similarity_search_with_score(query, k=k)
    return results
