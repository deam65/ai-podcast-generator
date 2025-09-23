import { Content } from "./contentRetrieval";

export interface LLMSummaryJob {
  id: string;
  content: Content[];
  createdAt: Date;
  updatedAt: Date;
  sseEndpoint: string;
}