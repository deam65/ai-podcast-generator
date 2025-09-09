import { PubSub } from "@google-cloud/pubsub";
import { Job } from "../models/job";
import { logger } from "../utils/logger";
require("dotenv").config();

export class PubSubService {
  private pubsub: PubSub;
  private topicName: string;

  constructor() {
    try {
      this.pubsub = new PubSub({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });

      this.topicName =
        process.env.PUBSUB_CONTENT_RETRIEVAL_TOPIC || "content-retrieval";

      logger.info("PubSubService initialized", {
        topicName: this.topicName,
      });
    } catch (error) {
      logger.error("Failed to initialize PubSubService", error);
      throw new Error("PubSub initialization failed");
    }
  }

  async publishJobMessage(job: Job): Promise<void> {
    try {
      const messagePayload = {
        jobId: job.id,
        sseEndpoint: job.sseEndpoint,
        numArticles: job.numArticles,
        topics: job.topics,
        sources: job.sources,
      };

      const messageData = JSON.stringify(messagePayload);

      const topic = this.pubsub.topic(this.topicName);

      const messageId = await topic.publishMessage({
        data: Buffer.from(messageData, "utf8"),
        attributes: {
          jobId: job.id,
          timestamp: new Date().toISOString(),
        },
      });

      logger.info("Job message published to Pub/Sub", {
        jobId: job.id,
        messageId,
        topicName: this.topicName,
      });
    } catch (error) {
      logger.error("Failed to publish job message to Pub/Sub", {
        jobId: job.id,
        topicName: this.topicName,
        error,
      });
      throw new Error(`Failed to publish job message: ${error}`);
    }
  }
}
