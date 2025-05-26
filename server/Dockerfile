# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3798
EXPOSE 3798

# Create necessary directories
RUN mkdir -p uploads outputs logs outputs/jobs

# Create a startup script
RUN echo '#!/bin/sh\necho "Pulling Ollama models..."\nnpm run pull-models\necho "Initializing database..."\nnpm run init-db\necho "Starting server..."\nnode server.js' > /app/start.sh && \
    chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]