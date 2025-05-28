#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Create necessary directories
mkdir -p uploads outputs data vector_db

# Initialize the database
echo "Initializing database..."
python -c "from models import init_db; init_db()"

# Run the application
echo "Starting the server on port 3798..."
gunicorn --bind 0.0.0.0:3798 --timeout 120 app:app