# SSE Service - Server-Sent Events for Real-Time Status Updates

## Overview

The SSE Service provides real-time status updates for job processing in the AI Podcast Generator microservices architecture. It enables clients to receive live updates about job progress without polling, using Server-Sent Events (SSE) technology.

## Architecture

### Cloud Run + Redis Implementation

```
Client ──> Cloud Run (SSE Service) ──> Redis ──> Pub/Sub ──> Other Microservices
                │                        │
                └── Active Connections ──┘
```

### Components

1. **SSE Service (Cloud Run)**: Handles SSE connections and broadcasts updates
2. **Redis (Memorystore)**: Coordinates connections across multiple service instances
3. **Pub/Sub**: Receives status updates from other microservices
4. **Connection Manager**: Hybrid memory + Redis connection management

## Infrastructure Setup

### Google Cloud Memorystore (Redis)
```yaml
Instance Type: Basic (development) / Standard (production)
Memory: 1GB (scales based on concurrent connections)
Network: Same VPC as Cloud Run services
```

### Cloud Run Configuration
```yaml
# cloudbuild.yaml
- name: 'gcr.io/cloud-builders/gcloud'
  args:
  - 'run'
  - 'deploy'
  - 'sse-service'
  - '--image=gcr.io/$PROJECT_ID/sse-service'
  - '--timeout=3600'           # 1 hour max connection
  - '--min-instances=1'        # Always keep running
  - '--max-instances=5'        # Scale for load
  - '--concurrency=1000'       # Many concurrent connections
  - '--cpu=1'
  - '--memory=1Gi'
  - '--set-env-vars=REDIS_HOST=10.x.x.x'
```

## Implementation Details

### Connection Management Strategy

The service uses a hybrid approach combining local memory for performance and Redis for cross-instance coordination:

```typescript
class ConnectionManager {
  private localConnections: Map<string, Response[]> = new Map();
  private redisClient: Redis;
  
  async addConnection(jobId: string, response: Response, instanceId: string) {
    // Store locally for fast access
    this.localConnections.set(jobId, response);
    
    // Register in Redis for cross-instance coordination
    await this.redisClient.sadd(`job:${jobId}:instances`, instanceId);
    await this.redisClient.setex(`instance:${instanceId}:${jobId}`, 3600, 'active');
  }
}
```

### Message Broadcasting Flow

When status updates arrive via Pub/Sub:

```typescript
pubsubService.onStatusUpdate(async (statusUpdate) => {
  const { jobId } = statusUpdate;
  
  // Check if this instance has connections for this job
  const localConnections = connectionManager.getLocalConnections(jobId);
  
  if (localConnections.length > 0) {
    // Broadcast to local connections
    localConnections.forEach(conn => {
      conn.write(`data: ${JSON.stringify(statusUpdate)}\n\n`);
    });
  }
  
  // Also publish to Redis for other instances
  await redisClient.publish(`job:${jobId}:updates`, JSON.stringify(statusUpdate));
});
```

### Cross-Instance Communication

```typescript
// Subscribe to Redis for updates from other instances
redisClient.subscribe(`job:*:updates`);
redisClient.on('message', (channel, message) => {
  const jobId = channel.split(':')[1];
  const statusUpdate = JSON.parse(message);
  
  // Broadcast to local connections only
  const localConnections = connectionManager.getLocalConnections(jobId);
  localConnections.forEach(conn => {
    conn.write(`data: ${JSON.stringify(statusUpdate)}\n\n`);
  });
});
```

## Service Structure

```
backend/services/sse-service/
├── src/
│   ├── app.ts                     # Express app with SSE routes
│   ├── server.ts                  # Server startup
│   ├── services/
│   │   ├── connectionManager.ts   # Hybrid memory+Redis management
│   │   ├── redisService.ts        # Redis client wrapper
│   │   └── pubsubService.ts       # Status update subscriber
│   └── models/
│       └── statusUpdate.ts        # Status update interface
├── Dockerfile
├── cloudbuild.yaml
└── package.json
```

## Status Update Message Format

```typescript
interface SSEStatusUpdate {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  stage: string; // e.g., 'retrieving-content', 'processing-articles', 'generating-summary'
  message: string;
  timestamp: string;
  data?: any; // Additional context-specific data
}
```

## Client Usage

### Creating a Job and Connecting to SSE

```javascript
// 1. Client creates job
const response = await fetch('/api/v1/jobs', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topics: ['technology'],
    sources: ['techcrunch', 'ars-technica']
  })
});

const { jobId, sseEndpoint } = await response.json();

// 2. Client connects to SSE endpoint
const eventSource = new EventSource(sseEndpoint);

eventSource.onmessage = (event) => {
  const statusUpdate = JSON.parse(event.data);
  console.log('Job update:', statusUpdate);
  
  // Update UI with progress
  updateProgressBar(statusUpdate.progress);
  updateStatusMessage(statusUpdate.message);
};

eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  // Implement reconnection logic
};
```

### SSE Endpoints

- `GET /api/v1/jobs/:jobId/events` - Connect to SSE stream for job updates
- `GET /health` - Service health check

## Architecture Flow

1. **Job Creation**: Client creates job → receives SSE endpoint URL
2. **SSE Connection**: Client connects to SSE endpoint
3. **Status Publishing**: Microservices publish status updates to dedicated Pub/Sub topic
4. **Message Broadcasting**: SSE service receives updates and broadcasts to connected clients
5. **Real-time Updates**: Client receives updates until job completion

## Benefits

- **Scalability**: Multiple Cloud Run instances can handle load
- **Reliability**: Redis coordination prevents message loss
- **Performance**: Local memory for fast connection lookup
- **Cost-Effective**: Pay-per-use Cloud Run + managed Redis
- **Familiar**: Uses existing Cloud Run deployment pattern

## Limitations

- **1-hour connection limit**: Clients need to reconnect periodically
- **Cold starts**: Brief interruption when scaling from zero (mitigated by min-instances=1)
- **Redis dependency**: Additional infrastructure component to manage

## Environment Variables

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
PUBSUB_STATUS_UPDATES_TOPIC=status-updates
PUBSUB_STATUS_UPDATES_SUBSCRIPTION=sse-service-subscription

# Redis Configuration
REDIS_HOST=10.x.x.x
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Server Configuration
PORT=8080
NODE_ENV=production

# SSE Configuration
SSE_HEARTBEAT_INTERVAL=30000  # 30 seconds
SSE_CONNECTION_TIMEOUT=3600   # 1 hour
```

## Deployment

### Prerequisites
- Google Cloud Memorystore Redis instance
- Pub/Sub topic for status updates
- VPC network configuration

### Deploy to Cloud Run
```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml

# Or using Docker
docker build -t gcr.io/PROJECT_ID/sse-service .
docker push gcr.io/PROJECT_ID/sse-service
gcloud run deploy sse-service --image gcr.io/PROJECT_ID/sse-service
```

## Monitoring and Observability

- **Health Checks**: `/health` endpoint for service monitoring
- **Connection Metrics**: Track active connections per job
- **Redis Metrics**: Monitor Redis memory usage and connection count
- **Pub/Sub Metrics**: Monitor message processing latency

## Security Considerations

- **Authentication**: Validate job ownership before allowing SSE connections
- **Rate Limiting**: Prevent abuse of SSE endpoints
- **CORS**: Configure appropriate CORS headers for web clients
- **Network Security**: Use VPC and firewall rules to secure Redis access

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start Redis locally (Docker)
docker run -d -p 6379:6379 redis:alpine

# Set environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Testing SSE Connections
```bash
# Test SSE endpoint with curl
curl -N -H "Accept: text/event-stream" http://localhost:8080/api/v1/jobs/test-job-id/events
```

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests for connection management
3. Update documentation for new features
4. Test with multiple concurrent connections
5. Validate Redis failover scenarios

## Related Services

- **job-initiation-api**: Creates jobs and provides SSE endpoint URLs
- **content-retrieval-service**: Publishes status updates during content processing
- **Other microservices**: Can publish status updates to the same Pub/Sub topic

This SSE service provides a scalable, reliable solution for real-time status updates in your microservices architecture while maintaining the benefits of serverless deployment on Cloud Run.
