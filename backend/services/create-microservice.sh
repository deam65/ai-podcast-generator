#!/bin/bash

# Microservice Generator Script
# Usage: ./create-microservice.sh <service-name>
# Example: ./create-microservice.sh content-retrieval-service

set -e

# Check if service name is provided
if [ -z "$1" ]; then
    echo "Error: Service name is required"
    echo "Usage: ./create-microservice.sh <service-name>"
    echo "Example: ./create-microservice.sh content-retrieval-service"
    exit 1
fi

SERVICE_NAME="$1"
SERVICE_DIR="$SERVICE_NAME"

# Check if service directory already exists
if [ -d "$SERVICE_DIR" ]; then
    echo "Error: Service directory '$SERVICE_DIR' already exists"
    exit 1
fi

echo "Creating microservice: $SERVICE_NAME"
echo "Directory: $SERVICE_DIR"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$SERVICE_DIR/src/"{controllers,middleware,models,routes,services,tests,utils}

# Create package.json
echo "Creating package.json..."
cat > "$SERVICE_DIR/package.json" << EOF
{
  "name": "$SERVICE_NAME",
  "version": "1.0.0",
  "description": "$SERVICE_NAME for AI Podcast Generator microservices",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "test": "echo \"Error: no test specified\" && exit 1",
    "clean": "rm -rf dist"
  },
  "keywords": [
    "microservice",
    "api",
    "podcast",
    "typescript"
  ],
  "author": "Darren Eam",
  "license": "ISC",
  "dependencies": {
    "@google-cloud/firestore": "^7.1.0",
    "@google-cloud/pubsub": "^4.0.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.15",
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.0",
    "@types/uuid": "^9.0.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create tsconfig.json
echo "Creating tsconfig.json..."
cat > "$SERVICE_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create Dockerfile
echo "Creating Dockerfile..."
cat > "$SERVICE_DIR/Dockerfile" << 'EOF'
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

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
EOF

# Create .env.example
echo "Creating .env.example..."
cat > "$SERVICE_DIR/.env.example" << EOF
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
FIRESTORE_COLLECTION=collection-name
PUBSUB_TOPIC=topic-name
PUBSUB_SUBSCRIPTION=subscription-name

# Server Configuration
PORT=3000
NODE_ENV=development

# Service-specific Configuration
# Add your service-specific environment variables here
EOF

# Create .gitignore
echo "Creating .gitignore..."
cat > "$SERVICE_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

# Create .dockerignore
echo "Creating .dockerignore..."
cat > "$SERVICE_DIR/.dockerignore" << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
.idea
*.swp
*.swo
*~
.DS_Store
dist
EOF

# Create cloudbuild.yaml
echo "Creating cloudbuild.yaml..."
cat > "$SERVICE_DIR/cloudbuild.yaml" << EOF
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/$SERVICE_NAME:\$COMMIT_SHA', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/$SERVICE_NAME:\$COMMIT_SHA']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '$SERVICE_NAME'
      - '--image'
      - 'gcr.io/\$PROJECT_ID/$SERVICE_NAME:\$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/\$PROJECT_ID/$SERVICE_NAME:\$COMMIT_SHA'
EOF

# Create README.md
echo "Creating README.md..."
cat > "$SERVICE_DIR/README.md" << EOF
# $SERVICE_NAME

## Overview
$SERVICE_NAME is a microservice in the AI Podcast Generator pipeline.

## Features
- TypeScript implementation
- Express.js web framework
- Google Cloud Firestore integration
- Google Cloud Pub/Sub messaging
- Docker containerization
- Cloud Run deployment ready

## Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud SDK (for deployment)

## Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update \`.env\` with your configuration values

## Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Build the project:
\`\`\`bash
npm run build
\`\`\`

Start the production server:
\`\`\`bash
npm start
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## Deployment

### Docker
Build the Docker image:
\`\`\`bash
docker build -t $SERVICE_NAME .
\`\`\`

Run the container:
\`\`\`bash
docker run -p 8080:8080 $SERVICE_NAME
\`\`\`

### Google Cloud Run
Deploy using Cloud Build:
\`\`\`bash
gcloud builds submit --config cloudbuild.yaml
\`\`\`

## API Endpoints

### Health Check
- \`GET /health\` - Service health status

## Environment Variables

See \`.env.example\` for required environment variables.

## Architecture

This service follows the microservices architecture pattern with:
- Express.js for HTTP handling
- Google Cloud Firestore for data persistence
- Google Cloud Pub/Sub for messaging
- Structured logging with Winston
- Input validation with Joi
- Error handling middleware

## Contributing

1. Follow TypeScript best practices
2. Add tests for new functionality
3. Update documentation as needed
4. Follow the established code structure
EOF

# Create basic source files
echo "Creating basic source files..."

# Create src/app.ts
cat > "$SERVICE_DIR/src/app.ts" << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.npm_package_name || 'microservice'
  });
});

// Routes
// TODO: Add your routes here

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
EOF

# Create src/server.ts
cat > "$SERVICE_DIR/src/server.ts" << 'EOF'
import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
EOF

# Create src/middleware/errorHandler.ts
cat > "$SERVICE_DIR/src/middleware/errorHandler.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
EOF

# Create placeholder files for common directories
touch "$SERVICE_DIR/src/controllers/.gitkeep"
touch "$SERVICE_DIR/src/models/.gitkeep"
touch "$SERVICE_DIR/src/routes/.gitkeep"
touch "$SERVICE_DIR/src/services/.gitkeep"
touch "$SERVICE_DIR/src/tests/.gitkeep"
touch "$SERVICE_DIR/src/utils/.gitkeep"

echo ""
echo "✅ Microservice '$SERVICE_NAME' created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $SERVICE_DIR"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. Update .env with your configuration"
echo "5. npm run dev"
echo ""
echo "Directory structure:"
find "$SERVICE_DIR" -type f | head -20
echo "..."
echo ""
echo "Happy coding! 🚀"
