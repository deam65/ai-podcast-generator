import { Job } from "../models/job";
import { FirestoreService } from "./firestoreService";
import { PubSubService } from "./pubsubService";
import { logger } from "../utils/logger";

export class JobService {
  private firestoreService: FirestoreService;
  private pubsubService: PubSubService;

  constructor() {
    this.firestoreService = new FirestoreService();
    this.pubsubService = new PubSubService();

    logger.info("JobService initialized");
  }

  async createJob(job: Job): Promise<Job> {
    try {
      const createdJob = await this.firestoreService.createJob(job);
      logger.info("Job created successfully", { jobId: job.id });
      return createdJob;
    } catch (error) {
      logger.error("Failed to create job", { jobId: job.id, error });
      throw new Error(`Failed to create job: ${error}`);
    }
  }

  async getJob(jobId: string): Promise<Job | null> {
    try {
      const job = await this.firestoreService.getJob(jobId);
      // Remove redundant logging - FirestoreService already logs this
      return job;
    } catch (error) {
      logger.error("Failed to retrieve job", { jobId, error });
      throw new Error(`Failed to retrieve job: ${error}`);
    }
  }

  async publishJobToQueue(job: Job): Promise<void> {
    try {
      await this.pubsubService.publishJobMessage(job);
      logger.info("Job published to queue successfully", { jobId: job.id });
    } catch (error) {
      logger.error("Failed to publish job to queue", { jobId: job.id, error });
      throw new Error(`Failed to publish job to queue: ${error}`);
    }
  }

  async updateJobStatus(jobId: string, status: string): Promise<void> {
    try {
      await this.firestoreService.updateJobStatus(jobId, status);
      logger.info("Job status updated successfully", { jobId, status });
    } catch (error) {
      logger.error("Failed to update job status", { jobId, status, error });
      throw new Error(`Failed to update job status: ${error}`);
    }
  }
}
