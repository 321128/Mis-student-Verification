FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for pdfkit and PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    wkhtmltopdf \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install spaCy model
RUN python -m spacy download en_core_web_sm

# Create necessary directories
RUN mkdir -p /app/uploads /app/outputs /app/data /app/vector_db

# Copy application code
COPY . .

# Expose port
EXPOSE 3798

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:3798", "--timeout", "120", "app:app"]