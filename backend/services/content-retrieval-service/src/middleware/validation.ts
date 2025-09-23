import { Request, Response, NextFunction } from 'express';
import { MessagePayload } from "@ai-podcast/shared-services";
import { ContentRetrievalJob } from "../models/contentRetrieval";
import { logger } from "../utils/logger";

export const validateContentRetrievalJob = (req: Request, res: Response, next: NextFunction) => {
  // This is for HTTP requests - not used for PubSub messages
  // Implementation would go here if needed for REST endpoints
  next();
}

export const validateMessagePayload = (data: MessagePayload): ContentRetrievalJob => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid message data: must be an object');
  }

  const { id, categories, status, createdAt, updatedAt, sseEndpoint } = data as any;

  if (!id || typeof id !== 'string') {
    throw new Error('Invalid message data: missing or invalid job ID');
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    throw new Error('Invalid message data: missing or invalid categories array');
  }

  if (!sseEndpoint || typeof sseEndpoint !== 'string') {
    throw new Error('Invalid message data: missing or invalid SSE endpoint');
  }

  // Validate each category
  for (const category of categories) {
    if (!category || typeof category !== 'string') {
      throw new Error('Invalid message data: categories must be non-empty strings');
    }
  }

  logger.info('Message payload validated successfully', {
    jobId: id,
    categoriesCount: categories.length,
    sseEndpoint
  });

  return {
    id,
    categories,
    status: status || 'pending',
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    sseEndpoint
  };
};
