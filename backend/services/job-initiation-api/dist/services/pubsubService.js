"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubService = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PubSubService {
    constructor() {
        try {
            this.pubsub = new pubsub_1.PubSub({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
            });
            this.topicName = process.env.PUBSUB_CONTENT_RETRIEVAL_TOPIC || 'content-retrieval';
            logger_1.logger.info('PubSubService initialized', {
                topicName: this.topicName
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize PubSubService', error);
            throw new Error('PubSub initialization failed');
        }
    }
    async publishJobMessage(job) {
        try {
            const messagePayload = {
                jobId: job.id,
                sseEndpoint: job.sseEndpoint,
                numArticles: job.numArticles,
                topics: job.topics,
                source: job.source
            };
            const messageData = JSON.stringify(messagePayload);
            const topic = this.pubsub.topic(this.topicName);
            const messageId = await topic.publishMessage({
                data: Buffer.from(messageData, 'utf8'),
                attributes: {
                    jobId: job.id,
                    source: job.source,
                    timestamp: new Date().toISOString()
                }
            });
            logger_1.logger.info('Job message published to Pub/Sub', {
                jobId: job.id,
                messageId,
                topicName: this.topicName
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to publish job message to Pub/Sub', {
                jobId: job.id,
                topicName: this.topicName,
                error
            });
            throw new Error(`Failed to publish job message: ${error}`);
        }
    }
}
exports.PubSubService = PubSubService;
//# sourceMappingURL=pubsubService.js.map