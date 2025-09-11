# Shared Services Package

This package contains shared utility services for the AI Podcast Generator microservices architecture.

## Overview

The shared services package provides common functionality that can be reused across multiple microservices, following the DRY (Don't Repeat Yourself) principle and ensuring consistency across the system.

## Services Included

### BaseFirestoreService<T>
A generic base class for Firestore operations with type safety.

**Features:**
- Generic CRUD operations (create, read, update, delete)
- Type-safe transformations between domain models and Firestore documents
- Consistent error handling and logging
- Status update functionality

**Usage:**
```typescript
import { BaseFirestoreService, BaseEntity, FirestoreDocument } from "@ai-podcast/shared-services";

interface MyEntity extends BaseEntity {
  // your entity properties
}

class MyFirestoreService extends BaseFirestoreService<MyEntity> {
  constructor() {
    super("my-collection", logger);
  }

  protected transformToFirestore(entity: MyEntity): FirestoreDocument {
    // implement transformation logic
  }

  protected transformFromFirestore(doc: FirestoreDocument): MyEntity {
    // implement transformation logic
  }
}
```

### BasePubSubService
A base class for Google Cloud Pub/Sub operations.

**Features:**
- Message publishing with attributes
- Subscription management
- Error handling and logging
- Support for both sync and async message processors

**Usage:**
```typescript
import { BasePubSubService } from "@ai-podcast/shared-services";

class MyPubSubService extends BasePubSubService {
  constructor() {
    super(logger);
  }

  async publishMyMessage(data: any) {
    return await this.publishMessage("my-topic", data, { type: "my-message" });
  }
}
```

### SecretsService
A service for managing Google Cloud Secret Manager operations.

**Features:**
- Secret retrieval with error handling
- Consistent logging
- Type-safe secret access

**Usage:**
```typescript
import { SecretsService } from "@ai-podcast/shared-services";

const secretsService = new SecretsService(logger);
const apiKey = await secretsService.fetchSecret("projects/my-project/secrets/api-key");
```

## Types

### BaseEntity
Base interface for all entities that can be stored in Firestore.
```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Logger
Interface for consistent logging across services.
```typescript
interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}
```

## Installation

This package is installed as a local file dependency in microservices:

```json
{
  "dependencies": {
    "@ai-podcast/shared-services": "file:../../shared-services"
  }
}
```

## Development

### Building
```bash
npm run build
```

### Watching for changes
```bash
npm run dev
```

## Architecture Benefits

1. **DRY Principle**: Eliminates code duplication across microservices
2. **Type Safety**: Generic base classes maintain type safety
3. **Maintainability**: Single source of truth for Google Cloud integrations
4. **Scalability**: Easy to add new microservices using shared patterns
5. **Consistency**: Standardized error handling and logging
6. **Testing**: Easier to mock and test shared functionality

## Microservices Using This Package

- **content-retrieval-service**: Uses BaseFirestoreService, BasePubSubService, and SecretsService
- **job-initiation-api**: Uses BaseFirestoreService and BasePubSubService

## Version History

- **1.0.0**: Initial release with BaseFirestoreService, BasePubSubService, and SecretsService
