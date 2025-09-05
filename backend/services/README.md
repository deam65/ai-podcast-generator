# Microservices

This directory contains all microservices for the AI Podcast Generator project.

## Services

- **job-initiation-api** - Handles job creation and initiation
- **content-retrieval-service** - Fetches and scrapes news articles

## Creating New Microservices

Use the provided generator script to create new microservices with consistent structure and configuration:

```bash
./create-microservice.sh <service-name>
```

### Example Usage

```bash
# Create a new service
./create-microservice.sh content-retrieval-service

# Navigate to the new service
cd content-retrieval-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Generated Structure

The script creates a complete microservice with:

**Configuration Files:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `Dockerfile` - Container configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore patterns
- `.dockerignore` - Docker ignore patterns
- `cloudbuild.yaml` - Cloud Build configuration
- `README.md` - Service documentation

**Source Code Structure:**
```
src/
├── app.ts                 # Express application setup
├── server.ts              # Server initialization
├── controllers/           # Request handlers
├── middleware/            # Custom middleware
│   └── errorHandler.ts    # Error handling
├── models/                # Data models and types
├── routes/                # API routes
├── services/              # Business logic services
├── tests/                 # Test files
└── utils/                 # Utility functions
```

**Features Included:**
- TypeScript configuration
- Express.js web framework
- Google Cloud Firestore integration
- Google Cloud Pub/Sub messaging
- Security middleware (Helmet, CORS)
- Error handling middleware
- Health check endpoint
- Docker containerization
- Cloud Run deployment configuration
- Structured logging setup
- Input validation with Joi

### Development Workflow

1. **Create Service**: Use the generator script
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Copy and edit `.env` file
4. **Develop**: Use `npm run dev` for hot reloading
5. **Build**: Use `npm run build` for production builds
6. **Test**: Add tests in `src/tests/`
7. **Deploy**: Use Docker or Cloud Build

### Architecture Patterns

All generated microservices follow these patterns:

- **Separation of Concerns**: Controllers, services, and models are separated
- **Error Handling**: Centralized error handling middleware
- **Environment Configuration**: Environment-based configuration
- **Security**: Built-in security middleware
- **Logging**: Structured logging for observability
- **Health Checks**: Standard health check endpoints
- **Containerization**: Docker-ready with multi-stage builds

### Customization

After generation, customize your service by:

1. **Adding Dependencies**: Update `package.json` as needed
2. **Implementing Business Logic**: Add services in `src/services/`
3. **Creating Routes**: Add API routes in `src/routes/`
4. **Adding Models**: Define data structures in `src/models/`
5. **Writing Tests**: Add comprehensive tests in `src/tests/`
6. **Updating Environment**: Add service-specific environment variables

### Best Practices

- Follow TypeScript best practices
- Use dependency injection for services
- Implement comprehensive error handling
- Add input validation for all endpoints
- Write unit and integration tests
- Use structured logging
- Follow RESTful API conventions
- Implement proper security measures
- Document your API endpoints

## Deployment

Each service includes:
- **Dockerfile** for containerization
- **cloudbuild.yaml** for Google Cloud Build
- **Health checks** for monitoring
- **Environment configuration** for different stages

Deploy using:
```bash
# Build and deploy with Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

## Contributing

1. Use the generator script for new services
2. Follow the established patterns and structure
3. Add comprehensive tests
4. Update documentation
5. Follow TypeScript and Node.js best practices
