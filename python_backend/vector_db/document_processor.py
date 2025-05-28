import os
import sys
import logging
import pandas as pd
import PyPDF2
import docx
from typing import List, Dict, Any, Tuple, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sqlalchemy import Column, Integer, String, JSON

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from models import Document, DocumentChunk, Job, JobResult, GeneratedDocument
from vector_db.vector_store import VectorStore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Process documents and add them to the vector store"""
    
    def __init__(self):
        """Initialize the document processor"""
        self.vector_store = VectorStore()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            length_function=len
        )
    
    def process_document(self, document_id: int) -> bool:
        """Process a document and add it to the vector store
        
        Args:
            document_id: ID of the document to process
            
        Returns:
            True if successful, False otherwise
        """
        session = Session()
        try:
            # Get document from database
            document = session.query(Document).filter(Document.id == document_id).first()
            if not document:
                logger.error(f"Document with ID {document_id} not found")
                return False
            
            # Extract text from document
            text = self._extract_text(document.file_path, document.file_type)
            if not text:
                logger.error(f"Failed to extract text from document {document.original_filename}")
                return False
            
            # Process based on document type
            if document.document_type == 'student_data':
                return self._process_student_data(document, text, session)
            elif document.document_type == 'job_description':
                return self._process_job_description(document, text, session)
            else:
                logger.error(f"Unknown document type: {document.document_type}")
                return False
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            return False
        finally:
            session.close()
    
    def _extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from a file
        
        Args:
            file_path: Path to the file
            file_type: Type of the file ('csv', 'pdf', 'docx', 'txt')
            
        Returns:
            Extracted text
        """
        try:
            if file_type == 'pdf':
                return self._extract_text_from_pdf(file_path)
            elif file_type == 'docx':
                return self._extract_text_from_docx(file_path)
            elif file_type == 'txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            elif file_type == 'csv':
                return self._extract_text_from_csv(file_path)
            else:
                logger.error(f"Unsupported file type: {file_type}")
                return ""
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            return ""
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from a PDF file"""
        text = ""
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from a DOCX file"""
        doc = docx.Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    
    def _extract_text_from_csv(self, file_path: str) -> str:
        """Extract text from a CSV file"""
        df = pd.read_csv(file_path)
        return df.to_json(orient='records')
    
    def _process_student_data(self, document: Document, text: str, session) -> bool:
        """Process student data CSV
        
        Args:
            document: Document object
            text: Extracted text (JSON string)
            session: Database session
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Parse CSV data
            df = pd.read_csv(document.file_path)
            
            # Process each row as a separate chunk
            for index, row in df.iterrows():
                # Convert row to dictionary
                student_data = row.to_dict()
                
                # Extract email (required for document generation)
                email = student_data.get('email', student_data.get('Email', ''))
                if not email:
                    logger.warning(f"No email found for student at row {index+1}")
                
                # Create metadata
                metadata = {
                    'document_id': document.id,
                    'document_type': 'student_data',
                    'row_index': index,
                    'email': email
                }
                
                # Add student data to metadata
                metadata.update(student_data)
                
                # Convert row to text
                row_text = ", ".join([f"{k}: {v}" for k, v in student_data.items() if v])
                
                # Create document chunk
                chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=index,
                    text=row_text,
                    doc_metadata=metadata
                )
                session.add(chunk)
                
                # Add to vector store
                vector_ids = self.vector_store.add_documents([row_text], [metadata])
                if vector_ids:
                    chunk.vector_id = vector_ids[0]
            
            session.commit()
            logger.info(f"Processed student data with {len(df)} rows")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error processing student data: {e}")
            return False
    
    def _process_job_description(self, document: Document, text: str, session) -> bool:
        """Process job description document
        
        Args:
            document: Document object
            text: Extracted text
            session: Database session
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Extract company and role from filename
            filename = document.original_filename
            parts = os.path.splitext(filename)[0].split('_')
            company = parts[0] if len(parts) > 0 else "Unknown"
            role = parts[1] if len(parts) > 1 else "Unknown"
            
            # Split text into chunks
            chunks = self.text_splitter.split_text(text)
            
            # Process each chunk
            for i, chunk_text in enumerate(chunks):
                # Create metadata
                metadata = {
                    'document_id': document.id,
                    'document_type': 'job_description',
                    'chunk_index': i,
                    'company': company,
                    'role': role
                }
                
                # Create document chunk
                chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=i,
                    text=chunk_text,
                    doc_metadata=metadata
                )
                session.add(chunk)
                
                # Add to vector store
                vector_ids = self.vector_store.add_documents([chunk_text], [metadata])
                if vector_ids:
                    chunk.vector_id = vector_ids[0]
            
            session.commit()
            logger.info(f"Processed job description with {len(chunks)} chunks")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error processing job description: {e}")
            return False