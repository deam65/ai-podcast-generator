import { Message, PubSub, Subscription } from "@google-cloud/pubsub";
import { Logger, MessageAttributes, MessagePayload } from "../types";
require("dotenv").config();

export class BasePubSubService {
  protected pubsub: PubSub;
  protected logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;

    try {
      this.pubsub = new PubSub({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });

      this.logger.info("BasePubSubService initialized");
    } catch (e) {
      this.logger.error("Failed to initialize PubSub service: ", e);
      throw new Error("PubSub initialization failed");
    }
  }

  async publishMessage(
    topicName: string,
    payload: MessagePayload,
    attributes?: MessageAttributes
  ): Promise<string> {
    try {
      const messageData = JSON.stringify(payload);
      const topic = this.pubsub.topic(topicName);

      const messageId = await topic.publishMessage({
        data: Buffer.from(messageData, "utf8"),
        attributes: {
          timestamp: new Date().toISOString(),
          ...attributes,
        },
      });

      this.logger.info("Message published to Pub/Sub", {
        messageId,
        topicName,
        payloadKeys: Object.keys(payload),
      });

      return messageId;
    } catch (error) {
      this.logger.error("Failed to publish message to Pub/Sub", {
        topicName,
        error,
      });
      throw new Error(`Failed to publish message: ${error}`);
    }
  }

  createSubscription(
    topicName: string,
    subscriptionName?: string
  ): Subscription {
    try {
      const subscription: Subscription = this.pubsub.subscription(
        subscriptionName || topicName
      );

      this.logger.info("PubSub subscription created", {
        topicName,
        subscriptionName: subscriptionName || topicName,
      });

      return subscription;
    } catch (e) {
      this.logger.error("Failed to create PubSub subscription", {
        topicName,
        subscriptionName,
        error: e,
      });
      throw e;
    }
  }

  handleMessage(
    message: Message,
    processor: (data: MessagePayload) => void | Promise<void>
  ): void {
    try {
      const data = JSON.parse(message.data.toString());

      this.logger.info("Received message", {
        messageId: message.id,
        dataKeys: Object.keys(data),
      });

      // Execute processor function
      const result = processor(data);

      // Handle both sync and async processors
      if (result instanceof Promise) {
        result
          .then(() => {
            message.ack();
            this.logger.info("Message processed and acknowledged", {
              messageId: message.id,
            });
          })
          .catch((error) => {
            this.logger.error("Error processing async message", {
              messageId: message.id,
              error,
            });
            message.nack();
          });
      } else {
        message.ack();
        this.logger.info("Message processed and acknowledged", {
          messageId: message.id,
        });
      }
    } catch (e) {
      this.logger.error("Error processing message", {
        messageId: message.id,
        error: e,
      });
      message.nack();
    }
  }

  handleError(error: Error): void {
    this.logger.error("Subscription error", { error });
  }

  subscribeToTopic(
    topicName: string,
    processor: (data: MessagePayload) => void | Promise<void>,
    subscriptionName?: string
  ): Subscription {
    try {
      const subscription = this.createSubscription(topicName, subscriptionName);

      subscription.on("message", (message: Message) => {
        this.handleMessage(message, processor);
      });

      subscription.on("error", this.handleError.bind(this));

      this.logger.info("Subscribed to PubSub topic", {
        topicName,
        subscriptionName: subscriptionName || topicName,
      });

      return subscription;
    } catch (e) {
      this.logger.error("Failed to subscribe to topic", {
        topicName,
        subscriptionName,
        error: e,
      });
      throw e;
    }
  }
}
