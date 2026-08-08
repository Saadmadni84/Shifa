"""
config.py

Centralized configuration settings for the Shifa Medical RAG Backend.
All values are driven by environment variables with production-ready defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ===========================
# PostgreSQL Database
# ===========================
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "shifa_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")

DB_POOL_MIN = int(os.getenv("DB_POOL_MIN", 2))
DB_POOL_MAX = int(os.getenv("DB_POOL_MAX", 20))

# ===========================
# Vector Database (Chroma)
# ===========================
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "medical_records")
DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", 4))

# ===========================
# Embeddings Model
# ===========================
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ===========================
# Gemini LLM
# ===========================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", 3))

# ===========================
# Chunking Parameters
# ===========================
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 500))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 80))

# ===========================
# Chatbot Memory & Token Limits
# ===========================
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", 20))
MAX_HISTORY_TOKENS = int(os.getenv("MAX_HISTORY_TOKENS", 2000))
TOKEN_ENCODING_NAME = os.getenv("TOKEN_ENCODING_NAME", "cl100k_base")

# ===========================
# Ingestion & Uploads
# ===========================
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", 25))
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".ogg", ".flac"}

# ===========================
# Retrieval Settings
# ===========================
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", 0.3))

# ===========================
# Logging
# ===========================
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")