# Node.js Dockerfile for Render deployment
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN node scripts/build-all.mjs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]