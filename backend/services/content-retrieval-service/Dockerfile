# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy the packed shared-services tarball (created by Cloud Build step 2)
COPY ai-podcast-shared-services-*.tgz ./

# Remove the file dependency and install the packed tarball instead
RUN sed -i 's|"@ai-podcast/shared-services": "file:../../shared-services"|"@ai-podcast/shared-services": "file:./ai-podcast-shared-services-1.0.0.tgz"|' package.json

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy the packed shared-services tarball
COPY ai-podcast-shared-services-*.tgz ./

# Remove the file dependency and install the packed tarball instead
RUN sed -i 's|"@ai-podcast/shared-services": "file:../../shared-services"|"@ai-podcast/shared-services": "file:./ai-podcast-shared-services-1.0.0.tgz"|' package.json

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
