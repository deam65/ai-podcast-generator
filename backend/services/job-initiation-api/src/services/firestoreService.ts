import { BaseFirestoreService, BaseEntity, FirestoreDocument, Timestamp } from "@ai-podcast/shared-services";
import { Job } from "../models/job";
import { logger } from "../utils/logger";

// Extend Job to implement BaseEntity
interface JobEntity extends Job, BaseEntity {}

export class FirestoreService extends BaseFirestoreService<JobEntity> {
  constructor() {
    const collectionName = process.env.FIRESTORE_JOBS_COLLECTION || "jobs";
    super(collectionName, logger);
  }

  protected transformToFirestore(job: JobEntity): FirestoreDocument {
    return {
      id: job.id,
      categories: job.categories,
      status: job.status,
      createdAt: Timestamp.fromDate(job.createdAt),
      updatedAt: Timestamp.fromDate(job.updatedAt),
      sseEndpoint: job.sseEndpoint,
    };
  }

  protected transformFromFirestore(doc: FirestoreDocument): JobEntity {
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
  async createJob(job: Job): Promise<Job> {
    return await this.create(job as JobEntity);
  }

  // Convenience method that matches the original interface
  async getJob(jobId: string): Promise<Job | null> {
    return await this.get(jobId);
  }

  // Convenience method that matches the original interface
  async updateJobStatus(jobId: string, status: string): Promise<void> {
    return await this.updateStatus(jobId, status);
  }
}
