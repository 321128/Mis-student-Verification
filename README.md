# MIS Student Verification + Document Generation System

A comprehensive platform that uses LLM agents to process student data and job descriptions, create vector embeddings, and generate personalized documents for students.

## Features

- **Document Processing**: Upload CSV files with student data and job description documents (PDF, DOCX, TXT)
- **Vector Database**: Converts documents into vector embeddings for semantic search
- **LLM Agent**: Uses Ollama with phi-mini or mistral models to generate personalized documents
- **Document Generation**: Creates documents in multiple formats (Markdown, PDF, DOCX)
- **Metadata Tracking**: Stores document metadata including student email, company, and role
- **Skills Analysis**: Extracts and matches skills from student profiles and job descriptions
- **Real-time Processing**: Provides status updates during document generation
- **Interview Preparation**: Tools for interview practice and feedback
- **Group Discussion Preparation**: Resources for GD topics and strategies

## System Architecture

- **Frontend**: React application (port 3797)
- **Backend**: Python Flask API (port 3798)
- **Database**: PostgreSQL (port 3799)
- **LLM**: Ollama running locally (port 11434)

## Setup and Installation

### Prerequisites

- Docker and Docker Compose
- Ollama installed locally with phi-mini and mistral models

### Install Ollama Models

```bash
ollama pull phi:mini
ollama pull mistral:latest
ollama pull nomic-embed-text
```

### Start the Application

```bash
# Clone the repository
git clone https://github.com/yourusername/Mis-student-Verification.git
cd Mis-student-Verification

# Start the application using Docker Compose
docker-compose up -d
```

## Usage

1. Access the web interface at http://localhost:3797
2. Upload a CSV file containing student data (must include email field)
3. Upload a job description file (name format: Company_Role.pdf/docx/txt)
4. The system will process the files and generate personalized documents
5. Download documents in your preferred format (Markdown, PDF, DOCX)

## CSV Format

The CSV file should contain student information with at least the following fields:
- `email` or `Email`: Student's email address (required for document naming)
- `full name of the student` or `Name`: Student's full name
- `Roll_Number` or `ID`: Student's ID or roll number
- Other fields: Skills, experience, education, etc.

## Job Description Format

The job description file should be named in the format: `CompanyName_RoleName.pdf` (or .docx, .txt)

## Document Output

Generated documents will be named in the format: `{email}_{company}_{role}.{extension}`

## API Endpoints

- `GET /api/status`: Check API status and Ollama connection
- `POST /api/upload`: Upload CSV and job description files
- `GET /api/job/{job_id}`: Get job processing status and results
- `GET /api/document/{document_id}`: Download a generated document
- `GET /api/documents/formats`: Get available document formats
- `GET /api/student/{email}/documents`: Get documents for a specific student
- `POST /api/generate/document`: Generate a document on demand

## Technologies Used

- **Frontend**: React.js, Bootstrap, Axios
- **Backend**: Python, Flask, LangChain, ChromaDB, Nomic Embeddings
- **LLM**: Ollama with phi-mini and mistral models
- **Database**: PostgreSQL
- **Document Processing**: PyPDF2, python-docx, markdown2, pdfkit
- **NLP**: NLTK, spaCy
- **Containerization**: Docker, Docker Compose

## Development

### Backend Development

```bash
cd python_backend
./run.sh
```

### Frontend Development

```bash
npm install
npm start
```

## Learn More

This project combines vector databases, LLM agents, and document generation to create a powerful tool for personalizing student documents based on job descriptions.
