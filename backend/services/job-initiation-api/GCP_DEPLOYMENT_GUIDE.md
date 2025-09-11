# GCP Deployment Guide - Job Initiation API

This guide provides complete instructions for deploying the AI Podcast Generator Job Initiation API service to Google Cloud Platform with automated CI/CD.

## Overview

This deployment includes:
- **Multi-stage Docker build** with shared-services dependency resolution
- **Automated Cloud Build triggers** on GitHub push
- **Container Registry** for image storage
- **Cloud Run** for serverless deployment
- **Proper IAM permissions** for all components

## Prerequisites

### 1. GCP Project Setup
```bash
# Create a new GCP project (or use existing)
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID

# Enable billing for the project (required)
# This must be done through the GCP Console
```

### 2. Enable Required APIs
```bash
# Enable all necessary Google Cloud APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable firestore.googleapis.com
```

### 3. GitHub Repository Setup
- Fork or clone the ai-podcast-generator repository
- Ensure you have admin access to the repository
- The repository should contain the `backend/services/job-initiation-api/cloudbuild.yaml` file

## Service Account Configuration

### 1. Create Custom Service Account
```bash
# Create a dedicated service account for the deployment
gcloud iam service-accounts create ai-podcast-generator \
    --display-name="AI Podcast Generator Service Account" \
    --description="Service account for AI Podcast Generator microservices"
```

### 2. Grant Required IAM Roles

**Critical**: The service account needs ALL of these permissions for the deployment to work:

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Container Registry permissions (for pushing Docker images)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Cloud Build permissions (for building containers)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"

# Cloud Run permissions (for deploying services)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Service Account User permissions (for impersonation during deployment)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Application-specific permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.viewer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/pubsub.editor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Cloud Build Trigger Setup

### 1. Connect GitHub Repository
```bash
# Connect your GitHub repository to Cloud Build
# This step requires manual setup in the GCP Console:
# 1. Go to Cloud Build > Triggers
# 2. Click "Connect Repository"
# 3. Select GitHub and authenticate
# 4. Choose your ai-podcast-generator repository
```

### 2. Create Build Trigger
```bash
# Create the automated build trigger
gcloud builds triggers create github \
    --repo-name=ai-podcast-generator \
    --repo-owner=YOUR_GITHUB_USERNAME \
    --branch-pattern="^job-initiation-microservice$" \
    --build-config=backend/services/job-initiation-api/cloudbuild.yaml \
    --service-account=projects/YOUR_PROJECT_ID/serviceAccounts/ai-podcast-generator@YOUR_PROJECT_ID.iam.gserviceaccount.com \
    --name=build-job-initiation-api \
    --description="Trigger to build job-initiation-api upon push to the job-initiation-microservice branch"
```

## Firestore Setup

### 1. Enable Firestore
```bash
# Create Firestore database in Native mode
gcloud firestore databases create --region=us-central1
```

### 2. Create Required Collections
The application expects these Firestore collections:
- `jobs` - For storing job information

## Pub/Sub Setup

### 1. Create Required Topics
```bash
# Create the content retrieval topic
gcloud pubsub topics create content-retrieval
```

## Deployment Process

### 1. Manual Deployment (Testing)
```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/ai-podcast-generator.git
cd ai-podcast-generator

# Switch to the deployment branch
git checkout job-initiation-microservice

# Trigger a manual build to test
gcloud builds submit \
    --config backend/services/job-initiation-api/cloudbuild.yaml \
    --substitutions=COMMIT_SHA=$(git rev-parse HEAD) \
    .
```

### 2. Automated Deployment
Once the trigger is set up, any push to the `job-initiation-microservice` branch will automatically:

1. **Build shared-services** as an npm package
2. **Extract** the package to the workspace
3. **Build** the job-initiation-api Docker image
4. **Push** the image to Container Registry
5. **Deploy** to Cloud Run

## Build Architecture

### Multi-Stage Build Process
The deployment uses a sophisticated 5-step build process:

1. **Step 1**: Build and pack shared-services using `Dockerfile.pack`
2. **Step 2**: Extract the packed shared-services to workspace
3. **Step 3**: Build the job-initiation-api service with proper dependency resolution
4. **Step 4**: Push the container image to Container Registry
5. **Step 5**: Deploy the container to Cloud Run

### Shared Services Dependency Resolution
The build process solves TypeScript compilation issues by:
- Pre-building shared-services as an npm package (`npm pack`)
- Dynamically modifying `package.json` to reference the packed file
- Regenerating `package-lock.json` for consistency

## Verification

### 1. Check Deployment Status
```bash
# List recent builds
gcloud builds list --limit=5

# Check Cloud Run service
gcloud run services describe job-initiation-api --region=us-central1

# Get service URL
gcloud run services describe job-initiation-api --region=us-central1 --format="value(status.url)"
```

### 2. Test Health Endpoint
```bash
# Get an identity token for authentication
TOKEN=$(gcloud auth print-identity-token)

# Test the health endpoint
curl -H "Authorization: Bearer $TOKEN" https://YOUR_SERVICE_URL/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T22:XX:XX.XXXZ",
  "service": "job-initiation-api",
  "version": "1.0.1"
}
```

## Troubleshooting

### Common Permission Issues

1. **Container Registry Push Fails**
   - Ensure `roles/storage.admin` is granted
   - Verify Container Registry API is enabled

2. **Cloud Run Deployment Fails**
   - Check `roles/run.admin` permission
   - Verify `roles/iam.serviceAccountUser` for impersonation

3. **Build Trigger Not Working**
   - Confirm GitHub repository is connected
   - Check `roles/cloudbuild.builds.builder` permission
   - Verify trigger is using the correct service account

### Build Logs
```bash
# View detailed build logs
gcloud builds log BUILD_ID

# Stream live build logs
gcloud builds log BUILD_ID --stream
```

## Security Considerations

### Service Account Permissions
The service account has been granted minimal required permissions:
- **Storage Admin**: Only for Container Registry operations
- **Cloud Build Builder**: Only for build operations
- **Cloud Run Admin**: Only for deployment operations
- **Service Account User**: Only for impersonation during deployment

### Cloud Run Security
- Service is deployed with authentication required
- No public access without proper identity tokens
- Uses non-root user in container for security

## Cost Optimization

### Resource Limits
The Cloud Run service is configured with:
- **Memory**: 512Mi (adjustable based on needs)
- **CPU**: 1 vCPU (adjustable)
- **Concurrency**: 80 requests per instance
- **Min instances**: 0 (scales to zero when not in use)
- **Max instances**: 100 (prevents runaway scaling)

### Container Registry
- Images are stored in `gcr.io/YOUR_PROJECT_ID/job-initiation-api`
- Old images can be cleaned up periodically to reduce storage costs

## Maintenance

### Updating Dependencies
1. Update `package.json` in both `job-initiation-api` and `shared-services`
2. Push changes to `job-initiation-microservice` branch
3. Automated deployment will handle the rest

### Monitoring
- Build logs: Cloud Build console
- Application logs: Cloud Run logs
- Metrics: Cloud Monitoring

## Summary

This deployment guide covers the complete setup for a production-ready, automated CI/CD pipeline for the Job Initiation API service. The multi-stage build process ensures proper dependency resolution, while the comprehensive IAM permissions enable seamless automated deployment.

**Key Success Factors:**
- ✅ All required APIs enabled
- ✅ Custom service account with complete permissions
- ✅ Proper GitHub repository connection
- ✅ Multi-stage build process for shared dependencies
- ✅ Container Registry for image storage
- ✅ Cloud Run for serverless deployment
- ✅ Automated CI/CD on git push

---

*Last updated: September 11, 2025*
*Tested with: Google Cloud SDK 537.0.0*
