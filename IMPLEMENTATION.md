# MIS Student Verification + Document Generation System Implementation

This document provides an overview of the implementation details for the MIS Student Verification and Document Generation System.

## System Architecture

The system is built with the following components:

1. **Frontend**: React application (port 3797)
2. **Backend**: Python Flask API (port 3798)
3. **Database**: PostgreSQL (port 3799)
4. **LLM**: Ollama running locally (port 11434)

## Backend Components

### Core Modules

- **app.py**: Main Flask application with API endpoints
- **config.py**: Configuration settings loaded from environment variables
- **models.py**: SQLAlchemy database models

### Vector Database

- **vector_db/vector_store.py**: ChromaDB vector database for document embeddings
- **vector_db/document_processor.py**: Process and chunk documents for vector storage

### LLM Agent

- **llm_agent/ollama_client.py**: Client for interacting with Ollama API
- **llm_agent/agent.py**: LLM agent for generating personalized documents

### Document Generator

- **document_generator/generator.py**: Generate documents in different formats (Markdown, PDF, DOCX)

## Database Schema

The system uses PostgreSQL with the following tables:

- **documents**: Stores uploaded documents (CSV, PDF, DOCX, TXT)
- **document_chunks**: Stores chunks of text from documents with vector embeddings
- **jobs**: Stores processing jobs
- **job_documents**: Association table for jobs and documents
- **job_results**: Stores processing results for each student
- **generated_documents**: Stores generated personalized documents

## API Endpoints

- `GET /api/status`: Check API status and Ollama connection
- `POST /api/upload`: Upload CSV and job description files
- `GET /api/job/{job_id}`: Get job processing status and results
- `GET /api/document/{document_id}`: Download a generated document
- `GET /api/documents/formats`: Get available document formats
- `GET /api/student/{email}/documents`: Get documents for a specific student
- `POST /api/generate/document`: Generate a document on demand

## Document Processing Flow

1. User uploads CSV with student data and a job description file
2. Backend processes files and creates a job
3. Documents are chunked and stored in the vector database
4. For each student:
   - Extract skills and calculate match score
   - Generate personalized document using LLM
   - Create documents in multiple formats
   - Store results in the database
5. User can view results and download generated documents

## LLM Integration

The system uses Ollama with the following models:

- **phi:mini**: Primary model for document generation
- **mistral:latest**: Alternative model (fallback)
- **nomic-embed-text**: For generating text embeddings

## Docker Configuration

The system uses Docker Compose with host networking to allow communication with Ollama running on the host machine. The services are configured to use the following ports:

- Frontend: 3797
- Backend: 3798
- PostgreSQL: 3799

## Testing

A test script (`test_ollama.py`) is provided to verify the Ollama connection and models.

## Sample Data

Sample data is provided for testing:

- `data/sample_students.csv`: Sample student data
- `data/Google_SoftwareEngineer.txt`: Sample job description

## Getting Started

1. Install Ollama and required models:
   ```bash
   ollama pull phi:mini
   ollama pull mistral:latest
   ollama pull nomic-embed-text
   ```

2. Start the application:
   ```bash
   ./start.sh
   ```

3. Access the web interface at http://localhost:3797

## Future Enhancements

1. Add user authentication and authorization
2. Implement more document formats and templates
3. Add support for more LLM providers
4. Enhance the matching algorithm with more sophisticated NLP techniques
5. Add batch processing for large datasets
6. Implement caching for improved performance
7. Add more visualization and analytics features