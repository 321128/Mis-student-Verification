On your local dev machine:

    Create a file: ~/.ssh/github_deploy_key

    Paste the entire private key content into it (what you posted earlier).

    Set correct permissions:

    chmod 600 ~/.ssh/github_deploy_key

Then try again:

    ssh -i ~/.ssh/github_deploy_key ashok@192.240.1.127




 ssh -i ~/.ssh/github_deploy_key ashok@192.240.1.127
Warning: Identity file /home/ashok/.ssh/github_deploy_key not accessible: No such file or directory.
ssh: connect to host 192.240.1.127 port 22: Connection refused


ssh -i ~/.ssh/github_deploy_key ashok@<HOST>


ssh key

 cat ~/.ssh/github_deploy_key
-----BEGIN OPENSSH PRIVATE KEY-----
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
AAmhxXMfuuz4hb/HWgKLet85g=
-----END OPENSSH PRIVATE KEY-----



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

