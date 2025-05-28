#!/bin/bash

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
  echo "Ollama is not running. Please start Ollama first."
  echo "You can install and run Ollama with:"
  echo "  curl -fsSL https://ollama.com/install.sh | sh"
  echo "  ollama serve"
  exit 1
fi

# Pull required models
echo "Pulling required Ollama models..."
ollama pull phi:mini
ollama pull mistral:latest
ollama pull nomic-embed-text

# Start the application with Docker Compose
echo "Starting MIS Student Verification + Document Generation System..."
docker-compose up --build -d

echo "Application is starting..."
echo "Frontend: http://localhost:3797"
echo "Backend: http://localhost:3798"
echo "PostgreSQL: localhost:3799"

echo "You can view logs with: docker-compose logs -f"
echo "To stop the application: docker-compose down"