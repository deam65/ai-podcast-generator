import { ContentRetrievalJob } from "../models/contentRetrieval";
import { ContentRetrievalService } from "../services/contentRetrievalService";
import { MessagePayload } from "@ai-podcast/shared-services";
import { logger } from "../utils/logger";
import { validateMessagePayload } from "../middleware/validation";

export class ContentRetrievalController {
  private contentRetrievalService: ContentRetrievalService;

  constructor() {
    this.contentRetrievalService = new ContentRetrievalService();
  }

  async handleMessage(data: MessagePayload): Promise<void> {
    try {
      // Validate and convert message data using validation middleware
      const job = validateMessagePayload(data);
      
      logger.info("Processing content retrieval job", {
        jobId: job.id,
        categories: job.categories
      });

      // Process the job: retrieve content and push to LLM service
      await this.contentRetrievalService.processJob(job);

      logger.info("Content retrieval job completed successfully", {
        jobId: job.id
      });

    } catch (error) {
      logger.error("Failed to process content retrieval job", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Re-throw error to ensure message is nack'd
      throw error;
    }
  }

  // Keep the original method for backward compatibility if needed
  async handleContentRetrievalJob(job: ContentRetrievalJob): Promise<void> {
    await this.contentRetrievalService.processJob(job);
  }
}
