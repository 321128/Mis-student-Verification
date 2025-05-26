# MIS Student Verification - Python Backend

This is the Python backend for the MIS Student Verification system. It provides APIs for processing student data and matching it with job descriptions.

## Features

- CSV file processing
- Job description analysis (PDF, DOCX, TXT)
- Student-job matching
- Skills extraction and analysis
- Real-time processing status updates

## API Endpoints

- `GET /api/status` - Check API status
- `POST /api/upload` - Upload CSV and job description files
- `GET /api/job/<job_id>` - Get job processing status

## Setup

### Prerequisites

- Python 3.10+
- pip

### Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the server:
   ```
   python app.py
   ```

## Docker

You can also run the backend using Docker:

```
docker build -t mis-student-verification-backend .
docker run -p 5000:5000 mis-student-verification-backend
```

## Using with Docker Compose

The entire application (frontend + backend) can be run using Docker Compose:

```
docker-compose -f docker-compose-python.yml up --build
```