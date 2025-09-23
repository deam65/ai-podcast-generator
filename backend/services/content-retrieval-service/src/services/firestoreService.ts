import { Timestamp } from "@google-cloud/firestore";
import { BaseFirestoreService, BaseEntity, FirestoreDocument } from "@ai-podcast/shared-services";
import { logger } from "../utils/logger";
import { ContentRetrievalJob } from "../models/contentRetrieval";

// Extend ContentRetrievalJob to implement BaseEntity
interface ContentRetrievalJobEntity extends ContentRetrievalJob, BaseEntity {}

export class FirestoreService extends BaseFirestoreService<ContentRetrievalJobEntity> {
  constructor() {
    const collectionName = process.env.FIRESTORE_COLLECTION_NAME || 'content-retrieval';
    super(collectionName, logger);
  }

  //implement abstractions from base class
  transformToFirestore(job: ContentRetrievalJobEntity): FirestoreDocument {
    return {
      id: job.id,
      categories: job.categories,
      status: job.status,
      createdAt: Timestamp.fromDate(job.createdAt),
      updatedAt: Timestamp.fromDate(job.updatedAt),
      sseEndpoint: job.sseEndpoint,
    };
  }

  transformFromFirestore(doc: FirestoreDocument): ContentRetrievalJobEntity {
    return {
      id: doc.id,
      categories: doc.categories,
      status: doc.status,
      createdAt: doc.createdAt.toDate(),
      updatedAt: doc.updatedAt.toDate(),
      sseEndpoint: doc.sseEndpoint,
    };
  }

  // Convenience method that matches the original interface
  async createJob(job: ContentRetrievalJob): Promise<ContentRetrievalJob> {
    return await this.create(job as ContentRetrievalJobEntity);
  }

  // Convenience method that matches the original interface
  async getJob(jobId: string): Promise<ContentRetrievalJob | null> {
    return await this.get(jobId);
  }

  // Convenience method that matches the original interface
  async updateJobStatus(jobId: string, status: string): Promise<void> {
    return await this.updateStatus(jobId, status);
  }
}
