# CRM Backend - Node.js/Express Application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code (excluding .env)
COPY . .
RUN rm -f .env

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/src ./src
COPY --from=builder --chown=backend:nodejs /app/server.js ./
COPY --from=builder --chown=backend:nodejs /app/package*.json ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R backend:nodejs /app/uploads

# Switch to non-root user
USER backend

# Expose port (will be overridden by PORT env var)
EXPOSE 3011

# Health check (port 3011 for CECARLAM)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3011/health || exit 1

# Start the application
CMD ["node", "server.js"]
