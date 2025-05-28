from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import json
import config

# Create SQLAlchemy engine and session
engine = create_engine(config.DB_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Document(Base):
    """Document model for storing uploaded documents"""
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'csv', 'pdf', 'docx', 'txt'
    document_type = Column(String(50), nullable=False)  # 'student_data', 'job_description'
    file_path = Column(String(512), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    jobs = relationship("Job", secondary="job_documents", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.original_filename}', type='{self.document_type}')>"

class DocumentChunk(Base):
    """Document chunk model for storing chunks of text from documents"""
    __tablename__ = 'document_chunks'
    
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    doc_metadata = Column(JSON, nullable=True)  # Renamed from 'metadata'
    vector_id = Column(String(255), nullable=True)  # ID in the vector database
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
    
    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, document_id={self.document_id}, chunk_index={self.chunk_index})>"
    
    def get_metadata(self):
        """Get metadata as a dictionary"""
        if isinstance(self.doc_metadata, str):
            return json.loads(self.doc_metadata)
        return self.doc_metadata or {}

class Job(Base):
    """Job model for storing processing jobs"""
    __tablename__ = 'jobs'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(String(36), unique=True, nullable=False)  # UUID
    status = Column(String(50), nullable=False)  # 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    total_students = Column(Integer, default=0)
    processed_students = Column(Integer, default=0)
    job_description_length = Column(Integer, default=0)
    
    # Relationships
    documents = relationship("Document", secondary="job_documents", back_populates="jobs")
    results = relationship("JobResult", back_populates="job", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="job", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Job(job_id='{self.job_id}', status='{self.status}', created_at='{self.created_at}')>"

class JobDocument(Base):
    """Association table for jobs and documents"""
    __tablename__ = 'job_documents'
    
    job_id = Column(Integer, ForeignKey('jobs.id'), primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'), primary_key=True)

class JobResult(Base):
    """Job result model for storing processing results"""
    __tablename__ = 'job_results'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=False)
    student_id = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)  # 'Success', 'Partial Success', 'Failure', 'Error'
    match_score = Column(Float, nullable=True)
    skills = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    
    # Relationships
    job = relationship("Job", back_populates="results")
    
    def __repr__(self):
        return f"<JobResult(id={self.id}, student_name='{self.student_name}', status='{self.status}')>"

class GeneratedDocument(Base):
    """Generated document model for storing personalized documents"""
    __tablename__ = 'generated_documents'
    
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    student_email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    role = Column(String(255), nullable=True)
    document_type = Column(String(50), nullable=False)  # 'markdown', 'pdf', 'docx'
    file_path = Column(String(512), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    content = Column(Text, nullable=True)  # Store the content for markdown
    
    # Relationships
    job = relationship("Job", back_populates="generated_documents")
    
    def __repr__(self):
        return f"<GeneratedDocument(id={self.id}, student_email='{self.student_email}', document_type='{self.document_type}')>"

# Create all tables
def init_db():
    Base.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()