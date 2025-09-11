# Container Registry Fix Documentation

## Issue Resolved
Fixed the container registry permissions issue for the job-initiation-api service deployment.

## Problem
- Cloud Build was failing with permission error: `denied: Permission "artifactregistry.repositories.uploadArtifacts" denied`
- The job-initiation-api service was configured to use Artifact Registry (`us-central1-docker.pkg.dev`) while other services used Container Registry (`gcr.io`)
- The `ai-podcast-images` repository in Artifact Registry was empty, causing push failures

## Solution Implemented
Switched job-initiation-api from Artifact Registry back to Container Registry to match the working pattern used by other services.

## Changes Made

### File: `backend/services/job-initiation-api/cloudbuild.yaml`

**Before (Artifact Registry):**
```yaml
# Step 3: Build the job-initiation-api service
- name: 'gcr.io/cloud-builders/docker'
  args: [
    'build',
    '-f', 'backend/services/job-initiation-api/Dockerfile',
    '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/ai-podcast-images/job-initiation-api:$COMMIT_SHA',
    '.'
  ]

# Step 4: Push the container image to Artifact Registry
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/ai-podcast-images/job-initiation-api:$COMMIT_SHA']

# Deploy step and images section also used Artifact Registry URLs
```

**After (Container Registry):**
```yaml
# Step 3: Build the job-initiation-api service
- name: 'gcr.io/cloud-builders/docker'
  args: [
    'build',
    '-f', 'backend/services/job-initiation-api/Dockerfile',
    '-t', 'gcr.io/$PROJECT_ID/job-initiation-api:$COMMIT_SHA',
    '.'
  ]

# Step 4: Push the container image to Container Registry
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/job-initiation-api:$COMMIT_SHA']

# Deploy step and images section now use Container Registry URLs
```

## Deployment Results
- ✅ Build completed successfully (Build ID: 4056da75-2949-45d1-aea4-caa7b35bace1)
- ✅ Container image pushed to: `gcr.io/ai-podcast-generator-67803/job-initiation-api:71d207ba35e768353435f5e421f9862c2596a736`
- ✅ Cloud Run service deployed successfully
- ✅ Service URL: https://job-initiation-api-zaffvvel3a-uc.a.run.app

## Multi-Stage Build Process Still Working
The complex 5-step build process for shared-services dependency resolution continues to work perfectly:
1. Build and pack shared-services ✅
2. Extract packed file to workspace ✅
3. Build job-initiation-api service ✅
4. Push to Container Registry ✅
5. Deploy to Cloud Run ✅

## Future Considerations
- All services now consistently use Container Registry (`gcr.io`)
- If migrating to Artifact Registry in the future, ensure:
  - Repository exists and is properly configured
  - Artifact Registry API is enabled
  - Service account has correct permissions
  - All services migrate together for consistency

## Commands Used for Deployment
```bash
# Deploy the service
gcloud beta builds submit --config backend/services/job-initiation-api/cloudbuild.yaml --substitutions=COMMIT_SHA=$(git rev-parse HEAD) .

# Test with proper authentication
TOKEN=$(gcloud auth print-identity-token)
curl -H "Authorization: Bearer $TOKEN" https://job-initiation-api-zaffvvel3a-uc.a.run.app/health
```

## Security Verification
- ✅ Authenticated requests work: Returns `{"status":"healthy","timestamp":"...","service":"job-initiation-api"}`
- ✅ Unauthenticated requests properly rejected: Returns HTTP 403
- ✅ Service is properly secured without public access

Date: September 11, 2025
Status: ✅ RESOLVED
