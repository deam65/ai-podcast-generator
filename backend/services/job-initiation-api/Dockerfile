# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy the packed shared-services (created by cloudbuild step)
COPY backend/services/job-initiation-api/ai-podcast-shared-services-*.tgz ./

# Create a temporary package.json that references the packed file
COPY backend/services/job-initiation-api/package.json ./package.json.orig
RUN sed 's|"@ai-podcast/shared-services": "file:../../shared-services"|"@ai-podcast/shared-services": "file:./ai-podcast-shared-services-1.0.0.tgz"|' package.json.orig > package.json

# Copy other service files
COPY backend/services/job-initiation-api/package-lock.json ./
COPY backend/services/job-initiation-api/tsconfig.json ./

# Install all dependencies (including the packed shared-services)
RUN npm ci

# Copy source code
COPY backend/services/job-initiation-api/src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy the packed shared-services
COPY backend/services/job-initiation-api/ai-podcast-shared-services-*.tgz ./

# Create a temporary package.json that references the packed file
COPY backend/services/job-initiation-api/package.json ./package.json.orig
RUN sed 's|"@ai-podcast/shared-services": "file:../../shared-services"|"@ai-podcast/shared-services": "file:./ai-podcast-shared-services-1.0.0.tgz"|' package.json.orig > package.json

# Copy package-lock.json
COPY backend/services/job-initiation-api/package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

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
