# Use Node.js LTS Alpine for minimal image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY app.js .

# Run as non-root user for security
USER node

EXPOSE 1121

CMD ["node", "app.js"]
