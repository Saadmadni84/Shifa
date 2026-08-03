"""
services/chunker.py

Split LangChain Documents into smaller chunks.
"""

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import (
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)


class DocumentChunker:
    """
    Splits documents into overlapping chunks.
    """

    def __init__(self):

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

    def split_documents(self, documents: list[Document]) -> list[Document]:

        chunks = self.splitter.split_documents(documents)

        return chunks