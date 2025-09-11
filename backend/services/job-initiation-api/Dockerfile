# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared-services package first
COPY backend/shared-services ./shared-services

# Copy service package files
COPY backend/services/job-initiation-api/package*.json ./service/

# Install shared-services dependencies and build it
WORKDIR /app/shared-services
RUN npm ci && npm run build

# Install service dependencies
WORKDIR /app/service

# Create a symlink so npm can find the shared-services package
RUN mkdir -p node_modules/@ai-podcast && \
    ln -s /app/shared-services node_modules/@ai-podcast/shared-services
RUN npm ci

# Copy service source code
COPY backend/services/job-initiation-api/src ./src
COPY backend/services/job-initiation-api/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy service package files
COPY backend/services/job-initiation-api/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy shared-services built package
COPY --from=builder /app/shared-services ./node_modules/@ai-podcast/shared-services

# Copy built application from builder stage
COPY --from=builder /app/service/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]
