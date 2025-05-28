import os
import sys
import logging
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from llm_agent.ollama_client import OllamaClient
from vector_db.vector_store import VectorStore
from models import Document, DocumentChunk, Session, Job, JobResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMAgent:
    """LLM Agent for generating personalized documents"""
    
    def __init__(self):
        """Initialize the LLM agent"""
        self.llm = OllamaClient()
        self.vector_store = VectorStore()
    
    def generate_personalized_document(
        self, 
        student_email: str, 
        company: str, 
        role: str
    ) -> str:
        """Generate a personalized document for a student
        
        Args:
            student_email: Email of the student
            company: Company name
            role: Job role
            
        Returns:
            Generated document text in markdown format
        """
        # Get student data from vector store
        student_data = self._get_student_data(student_email)
        if not student_data:
            logger.error(f"No student data found for email: {student_email}")
            return f"Error: No student data found for email: {student_email}"
        
        # Get job description from vector store
        job_description = self._get_job_description(company, role)
        if not job_description:
            logger.error(f"No job description found for company: {company}, role: {role}")
            return f"Error: No job description found for company: {company}, role: {role}"
        
        # Generate document
        return self._generate_document(student_data, job_description)
    
    def _get_student_data(self, email: str) -> Dict[str, Any]:
        """Get student data from vector store
        
        Args:
            email: Email of the student
            
        Returns:
            Student data dictionary
        """
        # Search vector store for student data
        results = self.vector_store.search(
            query=f"email: {email}",
            k=1,
            filter={"document_type": "student_data", "email": email}
        )
        
        if not results:
            return {}
        
        return results[0]['metadata']
    
    def _get_job_description(self, company: str, role: str) -> str:
        """Get job description from vector store
        
        Args:
            company: Company name
            role: Job role
            
        Returns:
            Job description text
        """
        # Search vector store for job description
        results = self.vector_store.search(
            query=f"company: {company} role: {role}",
            k=5,
            filter={"document_type": "job_description", "company": company, "role": role}
        )
        
        if not results:
            return ""
        
        # Combine chunks
        return "\n\n".join([result['text'] for result in results])
    
    def _generate_document(self, student_data: Dict[str, Any], job_description: str) -> str:
        """Generate a document using the LLM
        
        Args:
            student_data: Student data dictionary
            job_description: Job description text
            
        Returns:
            Generated document text in markdown format
        """
        # Extract student information
        student_name = student_data.get('name', student_data.get('Name', student_data.get('full name of the student', 'Student')))
        student_email = student_data.get('email', student_data.get('Email', ''))
        
        # Create prompt
        system_prompt = """You are an expert career counselor and document creator. 
Your task is to create a personalized document for a student applying for a job.
The document should be well-structured, professional, and tailored to the student's profile and the job description.
Format your response in Markdown with appropriate headings, bullet points, and sections.
"""
        
        prompt = f"""
# Student Information
{student_data}

# Job Description
{job_description}

Based on the student information and job description above, create a personalized document for {student_name} applying for this position.
The document should include:
1. A personalized introduction
2. How the student's skills and experience match the job requirements
3. Suggestions for highlighting specific achievements or experiences
4. Any areas where the student might need additional preparation
5. A conclusion with next steps

Format the document in Markdown with clear sections and professional language.
"""
        
        # Generate document
        try:
            generated_text = self.llm.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=config.MAX_TOKENS
            )
            
            # Add header with metadata
            header = f"""---
student_name: {student_name}
student_email: {student_email}
company: {student_data.get('company', '')}
role: {student_data.get('role', '')}
generated_date: {datetime.now().strftime('%Y-%m-%d')}
---

"""
            return header + generated_text
        except Exception as e:
            logger.error(f"Error generating document: {e}")
            return f"Error generating document: {str(e)}"
    
    def analyze_match(self, student_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """Analyze the match between student and job
        
        Args:
            student_data: Student data dictionary
            job_description: Job description text
            
        Returns:
            Analysis results
        """
        # Create prompt
        system_prompt = """You are an expert career counselor and job matching specialist.
Your task is to analyze how well a student's profile matches a job description.
Provide a detailed analysis with a match score and specific strengths and areas for improvement.
Format your response as JSON.
"""
        
        prompt = f"""
# Student Information
{student_data}

# Job Description
{job_description}

Analyze how well this student matches the job description. Provide:
1. A match score (0-100)
2. Key strengths that match the job requirements
3. Areas where the student could improve or lacks required skills
4. Overall assessment

Format your response as JSON with the following structure:
{{
  "match_score": 85,
  "strengths": ["strength1", "strength2", ...],
  "improvement_areas": ["area1", "area2", ...],
  "assessment": "Overall assessment text"
}}
"""
        
        # Generate analysis
        try:
            generated_text = self.llm.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=1024
            )
            
            # Parse JSON
            try:
                # Extract JSON from the response (in case the LLM adds extra text)
                import re
                json_match = re.search(r'({.*})', generated_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                    return json.loads(json_str)
                else:
                    return json.loads(generated_text)
            except json.JSONDecodeError:
                logger.error(f"Error parsing JSON from LLM response: {generated_text}")
                return {
                    "match_score": 0,
                    "strengths": [],
                    "improvement_areas": ["Error analyzing match"],
                    "assessment": "Error analyzing match"
                }
        except Exception as e:
            logger.error(f"Error analyzing match: {e}")
            return {
                "match_score": 0,
                "strengths": [],
                "improvement_areas": ["Error analyzing match"],
                "assessment": f"Error analyzing match: {str(e)}"
            }