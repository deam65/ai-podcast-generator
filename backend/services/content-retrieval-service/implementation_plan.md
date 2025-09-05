# Implementation Plan

## Overview
Create an event-driven TypeScript microservice that subscribes to Pub/Sub messages, retrieves news articles via NewsAPI, scrapes content using Playwright, stores data in Firestore with TTL, and publishes results to the next service in the pipeline.

The content-retrieval-service will be the second microservice in the AI Podcast Generator pipeline, responsible for fetching and scraping news articles based on job parameters received from the job-initiation-api. It follows the established microservices architecture patterns with Google Cloud integration, TypeScript implementation, and Docker containerization. The service will cache scraped content for 30 days to optimize performance and reduce redundant web scraping operations.

## Types
Define TypeScript interfaces for article data structures, message payloads, and service configurations.

**Article Interface:**
```typescript
interface Article {
  id: string;
  url: string;
  title: string;
  description: string;
  content: string;
  source: string;
  publishedAt: Date;
  scrapedAt: Date;
  expiresAt: Date; // TTL field
}
```

**Message Interfaces:**
```typescript
interface ContentRetrievalMessage {
  jobId: string;
  sseEndpoint: string;
  numArticles: number;
  topics: string[];
  source: 'news' | 'twitter' | 'reddit';
}

interface ContentSummaryMessage {
  jobId: string;
  sseEndpoint: string;
  articles: Article[];
}
```

**NewsAPI Response Types:**
```typescript
interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

interface NewsAPIArticle {
  source: { id: string; name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}
```

## Files
Create new microservice directory structure and configuration files following established patterns.

**New Files to Create:**
- `backend/services/content-retrieval-service/package.json` - Dependencies and scripts
- `backend/services/content-retrieval-service/tsconfig.json` - TypeScript configuration
- `backend/services/content-retrieval-service/Dockerfile` - Container configuration
- `backend/services/content-retrieval-service/.env.example` - Environment variables template
- `backend/services/content-retrieval-service/.gitignore` - Git ignore patterns
- `backend/services/content-retrieval-service/.dockerignore` - Docker ignore patterns
- `backend/services/content-retrieval-service/cloudbuild.yaml` - Cloud Build configuration
- `backend/services/content-retrieval-service/README.md` - Service documentation

**Source Code Files:**
- `src/app.ts` - Express application setup
- `src/server.ts` - Server initialization and Pub/Sub subscription
- `src/models/article.ts` - Article and message type definitions
- `src/services/newsApiService.ts` - NewsAPI integration
- `src/services/scrapingService.ts` - Playwright web scraping
- `src/services/firestoreService.ts` - Database operations with TTL
- `src/services/pubsubService.ts` - Message queue operations
- `src/services/sseService.ts` - Server-sent events for progress updates
- `src/controllers/messageController.ts` - Message processing logic
- `src/middleware/errorHandler.ts` - Error handling middleware
- `src/utils/logger.ts` - Structured logging utility
- `src/utils/urlValidator.ts` - URL validation and sanitization

## Functions
Define core service functions for message processing, content retrieval, and data management.

**Message Processing Functions:**
- `processContentRetrievalMessage(message: ContentRetrievalMessage): Promise<void>` - Main message handler
- `validateMessage(message: any): ContentRetrievalMessage` - Message validation

**NewsAPI Integration Functions:**
- `fetchArticles(topics: string[], numArticles: number): Promise<NewsAPIArticle[]>` - Fetch from NewsAPI
- `buildNewsAPIQuery(topics: string[]): string` - Construct API query parameters

**Web Scraping Functions:**
- `scrapeArticleContent(url: string): Promise<string>` - Playwright content extraction
- `initializeBrowser(): Promise<Browser>` - Browser setup with optimization
- `extractMainContent(page: Page): Promise<string>` - Content extraction logic
- `cleanupBrowser(browser: Browser): Promise<void>` - Resource cleanup

**Database Functions:**
- `checkArticleCache(url: string): Promise<Article | null>` - Check existing content
- `saveArticle(article: Article): Promise<void>` - Store with TTL
- `createArticleFromNewsAPI(newsArticle: NewsAPIArticle, scrapedContent: string): Article` - Data transformation

**Progress Tracking Functions:**
- `sendProgressUpdate(sseEndpoint: string, jobId: string, progress: ProgressUpdate): Promise<void>` - SSE updates
- `calculateProgress(completed: number, total: number): number` - Progress calculation

## Classes
Implement service classes following the established architecture patterns from job-initiation-api.

**NewsApiService Class:**
- File: `src/services/newsApiService.ts`
- Methods: `fetchArticles()`, `buildQuery()`, `validateResponse()`
- Handles API key management and rate limiting

**ScrapingService Class:**
- File: `src/services/scrapingService.ts`
- Methods: `scrapeContent()`, `initBrowser()`, `extractContent()`, `cleanup()`
- Manages Playwright browser instances and content extraction

**FirestoreService Class:**
- File: `src/services/firestoreService.ts`
- Methods: `getArticle()`, `saveArticle()`, `checkCache()`, `setupTTL()`
- Handles database operations with 30-day TTL configuration

**PubSubService Class:**
- File: `src/services/pubsubService.ts`
- Methods: `subscribe()`, `publishToSummary()`, `handleMessage()`
- Manages message queue subscriptions and publishing

**SSEService Class:**
- File: `src/services/sseService.ts`
- Methods: `sendUpdate()`, `formatProgressMessage()`
- Handles server-sent event communications

**MessageController Class:**
- File: `src/controllers/messageController.ts`
- Methods: `processMessage()`, `orchestrateRetrieval()`, `handleError()`
- Coordinates the entire content retrieval workflow

## Dependencies
Install required packages for TypeScript, Google Cloud services, web scraping, and HTTP handling.

**Production Dependencies:**
```json
{
  "@google-cloud/firestore": "^7.1.0",
  "@google-cloud/pubsub": "^4.0.7",
  "axios": "^1.6.0",
  "playwright": "^1.40.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "dotenv": "^17.2.2",
  "joi": "^17.11.0",
  "uuid": "^9.0.1",
  "winston": "^3.11.0"
}
```

**Development Dependencies:**
```json
{
  "@types/express": "^4.17.20",
  "@types/cors": "^2.8.15",
  "@types/node": "^20.8.0",
  "@types/uuid": "^9.0.6",
  "typescript": "^5.2.2",
  "ts-node": "^10.9.1",
  "nodemon": "^3.0.1"
}
```

**Playwright Browser Installation:**
- Requires `npx playwright install` for browser binaries
- Chromium browser for content scraping

## Testing
Implement comprehensive testing strategy for message processing, web scraping, and database operations.

**Test Files Structure:**
- `src/tests/newsApiService.test.ts` - NewsAPI integration tests
- `src/tests/scrapingService.test.ts` - Web scraping functionality tests
- `src/tests/firestoreService.test.ts` - Database operations tests
- `src/tests/messageController.test.ts` - Message processing tests
- `src/tests/integration.test.ts` - End-to-end workflow tests

**Testing Approach:**
- Unit tests for individual service methods
- Integration tests for Pub/Sub message flow
- Mock external APIs (NewsAPI) for consistent testing
- Test TTL functionality with Firestore
- Validate Playwright scraping with test HTML pages
- Error handling and retry logic testing

## Implementation Order
Sequential implementation steps to minimize conflicts and ensure successful integration.

1. **Project Setup and Configuration**
   - Create directory structure
   - Initialize package.json with dependencies
   - Configure TypeScript, Docker, and environment files
   - Set up logging and error handling utilities

2. **Core Models and Interfaces**
   - Define Article and message type interfaces
   - Create validation schemas with Joi
   - Implement URL validation utilities

3. **Database Service Implementation**
   - Implement FirestoreService with TTL support
   - Create article caching and retrieval methods
   - Test database operations and TTL functionality

4. **NewsAPI Integration**
   - Implement NewsApiService class
   - Add API key configuration and rate limiting
   - Test article fetching with various topics

5. **Web Scraping Service**
   - Implement ScrapingService with Playwright
   - Add content extraction and browser management
   - Test scraping with various news websites

6. **Message Queue Services**
   - Implement PubSubService for subscription and publishing
   - Add SSEService for progress updates
   - Test message handling and publishing flow

7. **Message Processing Controller**
   - Implement MessageController orchestration logic
   - Integrate all services into cohesive workflow
   - Add error handling and retry mechanisms

8. **Application and Server Setup**
   - Create Express app configuration
   - Implement server startup and Pub/Sub subscription
   - Add health check endpoints

9. **Docker and Deployment Configuration**
   - Configure Dockerfile with Playwright dependencies
   - Set up Cloud Build configuration
   - Test containerization and deployment

10. **Integration Testing and Documentation**
    - Perform end-to-end testing with job-initiation-api
    - Update README with setup and usage instructions
    - Validate complete message flow pipeline
