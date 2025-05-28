import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Flask configuration
PORT = int(os.getenv('PORT', 3798))
DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'

# LLM configuration
LLM_ENDPOINT = os.getenv('LLM_ENDPOINT', 'ollama')
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'phi:mini')
OLLAMA_ALTERNATIVE_MODEL = os.getenv('OLLAMA_ALTERNATIVE_MODEL', 'mistral:latest')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'nomic-embed-text')

# Database configuration
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = int(os.getenv('POSTGRES_PORT', 3799))
DB_NAME = os.getenv('POSTGRES_DB', 'mis_verification')
DB_USER = os.getenv('POSTGRES_USER', 'postgres')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'postgres')
DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# File paths
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
VECTOR_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vector_db')

# Create folders if they don't exist
for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER, DATA_FOLDER, VECTOR_DB_PATH]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Document processing
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
MAX_TOKENS = 4096  # For context window

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'csv': ['csv'],
    'document': ['pdf', 'docx', 'txt']
}