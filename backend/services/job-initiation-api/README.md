# Job Initiation API

A microservice for initiating podcast generation jobs in the AI Podcast Generator system. This service handles job creation, stores job metadata in Firestore, publishes messages to Pub/Sub for content retrieval, and provides real-time updates via Server-Sent Events.

## Architecture

- **Framework**: Node.js with TypeScript and Express.js
- **Database**: Google Cloud Firestore
- **Message Queue**: Google Cloud Pub/Sub
- **Deployment**: Google Cloud Run
- **Real-time Updates**: Server-Sent Events (SSE)

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Job Management
- `POST /api/v1/jobs` - Create a new podcast generation job
- `GET /api/v1/jobs/:jobId` - Get job status and details
- `GET /api/v1/jobs/:jobId/events` - SSE endpoint for real-time job updates

## Prerequisites

- Node.js 18+
- Google Cloud SDK (`gcloud`)
- Docker
- Google Cloud Project with:
  - Firestore enabled (Native mode)
  - Pub/Sub API enabled
  - Cloud Run API enabled
  - Cloud Build API enabled

## Environment Variables

Create a `.env` file for local development (never commit this file):

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
FIRESTORE_JOBS_COLLECTION=jobs
PUBSUB_CONTENT_RETRIEVAL_TOPIC=content-retrieval

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google Cloud Authentication
```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Set your project
gcloud config set project YOUR-PROJECT-ID
```

### 3. Create Firestore Database
```bash
# Create Firestore database (if not already created)
gcloud firestore databases create --region=us-central1
```

### 4. Create Pub/Sub Topic
```bash
# Create the content-retrieval topic
gcloud pubsub topics create content-retrieval
```

### 5. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Local Testing

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "job-initiation-api"
}
```

### Test Job Creation
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["technology", "politics"],
    "source": "news"
  }'
```

Expected response:
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "sseEndpoint": "/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/events",
  "status": "pending",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### Test Job Retrieval
```bash
curl http://localhost:3000/api/v1/jobs/{jobId}
```

### Test Server-Sent Events
```bash
curl -N http://localhost:3000/api/v1/jobs/{jobId}/events
```

## Docker Testing

### Build Docker Image
```bash
docker build -t job-initiation-api .
```

### Run Docker Container
```bash
docker run -p 8080:8080 \
  -e GOOGLE_CLOUD_PROJECT_ID=your-project-id \
  -e FIRESTORE_JOBS_COLLECTION=jobs \
  -e PUBSUB_CONTENT_RETRIEVAL_TOPIC=content-retrieval \
  job-initiation-api
```

### Test Docker Container
```bash
curl http://localhost:8080/health
```

## Deployment to Google Cloud Run

### Prerequisites
1. Enable required APIs:
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

2. Set up IAM permissions:
```bash
PROJECT_ID=$(gcloud config get-value project)

# Add required roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/run.invoker"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/storage.admin"
```

### Option 1: Automated Deployment (Recommended)
```bash
# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### Option 2: Manual Deployment
```bash
# Build and push to Container Registry
docker build -t gcr.io/$(gcloud config get-value project)/job-initiation-api .
docker push gcr.io/$(gcloud config get-value project)/job-initiation-api

# Deploy to Cloud Run
gcloud run deploy job-initiation-api \
  --image gcr.io/$(gcloud config get-value project)/job-initiation-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT_ID=$(gcloud config get-value project),FIRESTORE_JOBS_COLLECTION=jobs,PUBSUB_CONTENT_RETRIEVAL_TOPIC=content-retrieval \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## Production Testing

### Get Service URL
```bash
gcloud run services describe job-initiation-api \
  --region us-central1 \
  --format "value(status.url)"
```

### Test Production Endpoints
```bash
# Set your service URL
export SERVICE_URL="$(
  gcloud run services describe job-initiation-api \
    --region us-central1 \
    --format "value(status.url)"
)"

# Set your identity token
export IDENTITY_TOKEN="$(
  gcloud auth print-identity-token
)"

# Test health
curl $SERVICE_URL/health \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IDENTITY_TOKEN"

# Test job creation
curl -X POST "$SERVICE_URL/api/v1/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IDENTITY_TOKEN" \
  -d "{
    \"\": 3,
    \"categories\": [\"technology\"],
    \"source\": \"news\"
  }"

# Test job retrieval (replace {jobId} with actual ID)
curl $SERVICE_URL/api/v1/jobs/{jobId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IDENTITY_TOKEN"

# Test SSE endpoint (replace {jobId} with actual ID)
curl -N $SERVICE_URL/api/v1/jobs/{jobId}/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $IDENTITY_TOKEN"
```

## Monitoring and Logs

### View Logs
```bash
# View recent logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=job-initiation-api" \
  --limit 50

# Follow logs in real-time
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=job-initiation-api"
```

### Check Service Status
```bash
# List all Cloud Run services
gcloud run services list

# Get detailed service information
gcloud run services describe job-initiation-api --region us-central1
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
  - Make sure you have the run.invoker role assigned to your authed user
    ```bash
    gcloud run services add-iam-policy-binding job-initiation-api \
        --member='user:your-email@gmail.com' \
        --role='roles/run.invoker'
    ```

2. **Firestore Connection Issues**
   - Ensure Firestore database exists and is in Native mode
   - Check Google Cloud authentication
