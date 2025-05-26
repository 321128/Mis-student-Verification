from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
import json
import re
import time
from werkzeug.utils import secure_filename
import logging
from datetime import datetime
import threading
import uuid
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import PyPDF2
import docx
import spacy

# Download NLTK resources
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # If model not found, download it
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Store processing jobs
processing_jobs = {}

# Skills dictionary for matching
SKILLS = {
    'technical': [
        'python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
        'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'oracle', 'firebase',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'machine learning', 'deep learning', 'ai', 'data science', 'big data',
        'hadoop', 'spark', 'tableau', 'power bi', 'excel', 'vba',
        'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
        'rest api', 'graphql', 'microservices', 'serverless',
        'linux', 'unix', 'windows', 'macos', 'android', 'ios',
        'agile', 'scrum', 'kanban', 'jira', 'confluence'
    ],
    'soft': [
        'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
        'time management', 'organization', 'adaptability', 'flexibility', 'creativity',
        'work ethic', 'interpersonal skills', 'emotional intelligence', 'conflict resolution',
        'decision making', 'stress management', 'attention to detail', 'customer service',
        'presentation', 'negotiation', 'persuasion', 'mentoring', 'coaching'
    ],
    'business': [
        'marketing', 'sales', 'finance', 'accounting', 'hr', 'human resources',
        'project management', 'product management', 'operations', 'strategy',
        'business development', 'customer relationship management', 'crm',
        'supply chain', 'logistics', 'procurement', 'quality assurance', 'qa',
        'business analysis', 'data analysis', 'market research', 'competitive analysis',
        'budgeting', 'forecasting', 'risk management', 'compliance', 'legal'
    ]
}

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
    return text

def extract_text_from_docx(docx_file):
    """Extract text from DOCX file"""
    text = ""
    try:
        doc = docx.Document(docx_file)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
    return text

def preprocess_text(text):
    """Preprocess text for analysis"""
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    
    return ' '.join(tokens)

def extract_skills(text):
    """Extract skills from text"""
    skills = {
        'technical': [],
        'soft': [],
        'business': []
    }
    
    # Process with spaCy for better entity recognition
    doc = nlp(text.lower())
    
    # Extract skills from each category
    for category, skill_list in SKILLS.items():
        for skill in skill_list:
            if skill in text.lower():
                # Check if it's a complete word or part of a larger word
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text.lower()):
                    skills[category].append(skill)
    
    return skills

def calculate_match_score(student_skills, job_skills):
    """Calculate match score between student skills and job skills"""
    if not job_skills:
        return 0
    
    # Flatten skills lists
    student_skills_flat = []
    for category in student_skills:
        student_skills_flat.extend(student_skills[category])
    
    job_skills_flat = []
    for category in job_skills:
        job_skills_flat.extend(job_skills[category])
    
    # Calculate match score
    if not job_skills_flat:
        return 0
    
    matches = set(student_skills_flat).intersection(set(job_skills_flat))
    score = len(matches) / len(job_skills_flat) * 100
    
    return min(score, 100)  # Cap at 100%

def analyze_student_profile(student_data):
    """Analyze student profile and extract skills"""
    # Combine all relevant fields
    profile_text = ""
    for key, value in student_data.items():
        if isinstance(value, str):
            profile_text += value + " "
    
    # Preprocess text
    processed_text = preprocess_text(profile_text)
    
    # Extract skills
    skills = extract_skills(processed_text)
    
    return skills

def analyze_job_description(job_desc_text):
    """Analyze job description and extract skills"""
    # Preprocess text
    processed_text = preprocess_text(job_desc_text)
    
    # Extract skills
    skills = extract_skills(processed_text)
    
    return skills

def process_student_data(job_id, student_data, job_desc_text):
    """Process student data and match with job description"""
    job = processing_jobs[job_id]
    total_students = len(student_data)
    job['total_students'] = total_students
    
    # Analyze job description
    job_skills = analyze_job_description(job_desc_text)
    job['job_skills'] = job_skills
    
    results = []
    
    # Process each student
    for i, student in enumerate(student_data):
        try:
            # Update progress
            job['processed_students'] = i + 1
            
            # Get student name and ID
            student_name = student.get('full name of the student', student.get('Name', student.get('name', f'Student {i+1}')))
            student_id = student.get('Roll_Number', student.get('RollNumber', student.get('ID', student.get('StudentID', f'S{1000+i}'))))
            
            # Analyze student profile
            student_skills = analyze_student_profile(student)
            
            # Calculate match score
            match_score = calculate_match_score(student_skills, job_skills)
            
            # Determine status based on match score
            if match_score >= 70:
                status = 'Success'
            elif match_score >= 40:
                status = 'Partial Success'
            else:
                status = 'Failure'
            
            # Simulate email sending (in a real app, this would actually send emails)
            email_sent = match_score >= 50
            
            # Add to results
            results.append({
                'name': student_name,
                'rollNumber': student_id,
                'status': status,
                'emailSent': email_sent,
                'matchScore': round(match_score, 2),
                'skills': student_skills
            })
            
            # Simulate processing time
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error processing student {i}: {e}")
            results.append({
                'name': student.get('full name of the student', student.get('Name', student.get('name', f'Student {i+1}'))),
                'rollNumber': student.get('Roll_Number', student.get('RollNumber', student.get('ID', student.get('StudentID', f'S{1000+i}')))),
                'status': 'Error',
                'emailSent': False,
                'error': str(e)
            })
    
    # Update job status
    job['status'] = 'completed'
    job['results'] = results
    job['completed_at'] = datetime.now().isoformat()
    
    return results

@app.route('/api/status', methods=['GET'])
def status():
    """API status endpoint"""
    return jsonify({"status": "Server is running"})

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Upload files endpoint"""
    try:
        # Check if files are present
        if 'csv' not in request.files or 'jobDesc' not in request.files:
            return jsonify({"error": "Missing files"}), 400
        
        csv_file = request.files['csv']
        job_desc_file = request.files['jobDesc']
        
        # Check if files are valid
        if csv_file.filename == '' or job_desc_file.filename == '':
            return jsonify({"error": "No selected files"}), 400
        
        # Save CSV file
        csv_filename = secure_filename(csv_file.filename)
        csv_path = os.path.join(app.config['UPLOAD_FOLDER'], csv_filename)
        csv_file.save(csv_path)
        
        # Save job description file
        job_desc_filename = secure_filename(job_desc_file.filename)
        job_desc_path = os.path.join(app.config['UPLOAD_FOLDER'], job_desc_filename)
        job_desc_file.save(job_desc_path)
        
        # Read CSV file
        try:
            df = pd.read_csv(csv_path)
            student_data = df.to_dict('records')
        except Exception as e:
            return jsonify({"error": f"Error reading CSV file: {str(e)}"}), 400
        
        # Read job description file
        job_desc_text = ""
        if job_desc_filename.endswith('.pdf'):
            with open(job_desc_path, 'rb') as f:
                job_desc_text = extract_text_from_pdf(f)
        elif job_desc_filename.endswith('.docx'):
            with open(job_desc_path, 'rb') as f:
                job_desc_text = extract_text_from_docx(f)
        else:
            with open(job_desc_path, 'r') as f:
                job_desc_text = f.read()
        
        # Create job ID
        job_id = str(uuid.uuid4())
        
        # Create processing job
        processing_jobs[job_id] = {
            'id': job_id,
            'status': 'processing',
            'created_at': datetime.now().isoformat(),
            'total_students': len(student_data),
            'processed_students': 0,
            'job_description_length': len(job_desc_text),
            'csv_filename': csv_filename,
            'job_desc_filename': job_desc_filename
        }
        
        # Start processing in background
        threading.Thread(
            target=process_student_data,
            args=(job_id, student_data, job_desc_text)
        ).start()
        
        return jsonify({
            "job_id": job_id,
            "status": "processing",
            "message": "Files uploaded successfully and processing started"
        })
        
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/job/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status endpoint"""
    if job_id not in processing_jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = processing_jobs[job_id]
    
    response = {
        "job_id": job_id,
        "status": job['status'],
        "total_students": job['total_students'],
        "processed_students": job['processed_students']
    }
    
    if job['status'] == 'completed':
        response['results'] = job['results']
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)