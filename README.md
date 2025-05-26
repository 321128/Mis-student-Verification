# MIS Student Verification System

A comprehensive system for analyzing student profiles and matching them with job descriptions.

## Features

- Upload and process student CSV data
- Analyze job descriptions (PDF, DOCX, TXT)
- Match students with job requirements
- Extract and analyze skills
- Real-time processing status updates
- Interview preparation tools
- Group discussion preparation tools

## Architecture

The application consists of two main components:

1. **Frontend**: React.js application
2. **Backend**: Python Flask API with NLP capabilities

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.10+ (for local development)

### Running with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the application
docker-compose up --build

# Access the application at http://localhost:3000
```

### Local Development

#### Frontend

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

#### Backend

```bash
# Navigate to the backend directory
cd python_backend

# Run the setup script
./run.sh
```

## Usage

1. Upload a CSV file containing student data
2. Upload a job description file (PDF, DOCX, or TXT)
3. Click "Process Files" to start the analysis
4. View the results showing student matches with the job description
5. Use the Interview Prep and GD Prep tabs for additional tools

## CSV Format

The CSV file should contain the following columns:
- `full name of the student` or `Name`: Student's full name
- `Roll_Number` or `ID`: Student's ID or roll number
- Additional fields like skills, education, etc. will enhance the matching

## API Endpoints

- `POST /api/upload`: Upload CSV and job description files
- `GET /api/job/{job_id}`: Get job processing status
- `GET /api/status`: Check API status

## Technologies Used

- **Frontend**: React.js, Bootstrap, Axios
- **Backend**: Python, Flask, pandas, NLTK, spaCy
- **File Processing**: PyPDF2, python-docx
- **Containerization**: Docker, Docker Compose

## Additional Commands

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
