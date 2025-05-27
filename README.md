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
DJZHRpOEihMI0X/qHyo2w6A+I=
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

