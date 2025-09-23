import { ContentRetrievalJob, Content } from "../models/contentRetrieval";
import { LLMSummaryJob } from "../models/llmSummary";

/**
 * Builds an LLMSummaryJob payload from a ContentRetrievalJob and Content
 * @param job - The original content retrieval job
 * @param content - The content to be processed by the LLM service
 * @returns LLMSummaryJob object ready for publishing
 */
export const buildLLMSummaryJob = (job: ContentRetrievalJob, content: Content): LLMSummaryJob => {
  return {
    id: job.id,
    content: [content], // LLMSummaryJob expects an array of Content
    createdAt: new Date(),
    updatedAt: new Date(),
    sseEndpoint: job.sseEndpoint
  };
};

/**
 * Builds a message payload for PubSub publishing
 * @param job - The LLM summary job
 * @param content - The content being published
 * @returns Message payload object
 */
export const buildContentMessagePayload = (job: LLMSummaryJob, content: Content) => {
  return {
    jobId: job.id,
    sseEndpoint: job.sseEndpoint,
    content: JSON.stringify(content),
  };
};
