import { BasePubSubService, Message, Subscription } from "@ai-podcast/shared-services";
import { logger } from "../utils/logger";
import { Content, ContentRetrievalJob } from "../models/contentRetrieval";
import { LLMSummaryJob } from "../models/llmSummary";

export class PubSubService extends BasePubSubService {
  private contentRetrievalTopic: string;
  private llmSummaryTopic: string;
  private sseUpdatesTopic: string;

  constructor() {
    super(logger);

    this.contentRetrievalTopic =
      process.env.PUBSUB_CONTENT_RETRIEVAL_TOPIC || "content-retrieval";

    this.llmSummaryTopic =
      process.env.PUBSUB_LLM_SUMMARY_TOPIC || "llm-summary";

    this.sseUpdatesTopic =
      process.env.PUBSUB_SSE_UPDATES_TOPIC || "sse-updates";

    this.logger.info("PubSubService initialized", {
      contentRetrievalTopic: this.contentRetrievalTopic,
      llmSummaryTopic: this.llmSummaryTopic,
      sseUpdatesTopic: this.sseUpdatesTopic,
    });
  }

  handleMessage(message: Message) {
    try {
      const data = JSON.parse(message.data.toString());

      this.logger.info("Received message", {
        messageId: message.id,
        data: data,
      });

      message.ack();

    } catch (e) {
      this.logger.error("Error processing message", {
        message,
        e,
      });
      message.nack();
    }
  }

  handleError(error: Error) {
    this.logger.error("Subscription error", { error });
  }

  subscribeToTopic(): Subscription {
    try {
      const subscription: Subscription = this.createSubscription(this.contentRetrievalTopic);

      subscription.on("message", this.handleMessage.bind(this));
      subscription.on("error", this.handleError.bind(this));

      this.logger.info(
        'PubSub service subscribed to "' + this.contentRetrievalTopic + '"'
      );

      return subscription;
    } catch (e) {
      this.logger.error(
        'PubSub service failed to subscribe to topic "' +
          this.contentRetrievalTopic +
          '"'
      );
      throw e;
    }
  }

  async publishContentMessage(
    job: LLMSummaryJob,
    content: Content
  ): Promise<void> {
    try {
      const messagePayload = {
        jobId: job.id,
        sseEndpoint: job.sseEndpoint,
        content: JSON.stringify(content),
      };

      const messageId = await this.publishMessage(
        this.llmSummaryTopic,
        messagePayload,
        {
          jobId: job.id,
          content: JSON.stringify(content),
        }
      );

      this.logger.info("Content message published to Pub/Sub", {
        jobId: job.id,
        messageId,
        topicName: this.llmSummaryTopic,
      });
    } catch (error) {
      this.logger.error("Failed to publish job message to Pub/Sub", {
        jobId: job.id,
        topicName: this.llmSummaryTopic,
        error,
      });
      throw new Error(`Failed to publish job message: ${error}`);
    }
  }

  //TODO: add a class function to publish SSE updates to the 'sse-updates' topic
}
