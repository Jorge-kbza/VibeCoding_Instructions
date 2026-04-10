# Weather API - Build Stage
FROM node:18-alpine AS builder

LABEL maintainer="weather-api-team@example.com"
LABEL version="1.0.0"

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy application code
COPY src ./src
COPY tests ./tests
COPY jest.config.js .

# Run tests
RUN npm run test

# ---

# Weather API - Runtime Stage
FROM node:18-alpine AS runtime

LABEL maintainer="weather-api-team@example.com"
LABEL version="1.0.0"  
LABEL description="REST API for weather data consumption and transformation"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code from builder stage
COPY --from=builder /build/src ./src

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set proper permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s \
  --timeout=10s \
  --start-period=5s \
  --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })" || exit 1

# Start application
CMD ["npm", "start"]
