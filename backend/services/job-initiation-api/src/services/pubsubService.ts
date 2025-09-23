import { BasePubSubService } from "@ai-podcast/shared-services";
import { Job } from "../models/job";
import { logger } from "../utils/logger";

export class PubSubService extends BasePubSubService {
  private topicName: string;

  constructor() {
    super(logger);

    this.topicName =
      process.env.PUBSUB_CONTENT_RETRIEVAL_TOPIC || "content-retrieval";

    this.logger.info("PubSubService initialized", {
      topicName: this.topicName,
    });
  }

  async publishJobMessage(job: Job): Promise<void> {
    try {
      const messagePayload = {
        jobId: job.id,
        sseEndpoint: job.sseEndpoint,
        categories: job.categories,
        sources: job.sources,
      };

      const messageId = await this.publishMessage(
        this.topicName,
        messagePayload,
        {
          jobId: job.id,
        }
      );

      this.logger.info("Job message published to Pub/Sub", {
        jobId: job.id,
        messageId,
        topicName: this.topicName,
      });
    } catch (error) {
      this.logger.error("Failed to publish job message to Pub/Sub", {
        jobId: job.id,
        topicName: this.topicName,
        error,
      });
      throw new Error(`Failed to publish job message: ${error}`);
    }
  }
}
