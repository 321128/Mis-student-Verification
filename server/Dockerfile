# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm install mongoose@7.5.0

# Copy the rest of the application code
COPY . .

# Expose port 3798
EXPOSE 3798

# Create necessary directories
RUN mkdir -p uploads outputs logs outputs/jobs

# Start the application
CMD ["node", "server.js"]