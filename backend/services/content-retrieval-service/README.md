# content-retrieval-service

## Overview
content-retrieval-service is a microservice in the AI Podcast Generator pipeline.

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
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration values

## Development

Start the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Testing
```bash
npm test
```

## Deployment

### Docker
Build the Docker image:
```bash
docker build -t content-retrieval-service .
```

Run the container:
```bash
docker run -p 8080:8080 content-retrieval-service
```

### Google Cloud Run
Deploy using Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

## Environment Variables

See `.env.example` for required environment variables.

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
