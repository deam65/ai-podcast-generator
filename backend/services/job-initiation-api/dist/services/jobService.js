"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const firestoreService_1 = require("./firestoreService");
const pubsubService_1 = require("./pubsubService");
const logger_1 = require("../utils/logger");
class JobService {
    constructor() {
        this.firestoreService = new firestoreService_1.FirestoreService();
        this.pubsubService = new pubsubService_1.PubSubService();
        logger_1.logger.info('JobService initialized');
    }
    async createJob(job) {
        try {
            const createdJob = await this.firestoreService.createJob(job);
            logger_1.logger.info('Job created successfully', { jobId: job.id });
            return createdJob;
        }
        catch (error) {
            logger_1.logger.error('Failed to create job', { jobId: job.id, error });
            throw new Error(`Failed to create job: ${error}`);
        }
    }
    async getJob(jobId) {
        try {
            const job = await this.firestoreService.getJob(jobId);
            // Remove redundant logging - FirestoreService already logs this
            return job;
        }
        catch (error) {
            logger_1.logger.error('Failed to retrieve job', { jobId, error });
            throw new Error(`Failed to retrieve job: ${error}`);
        }
    }
    async publishJobToQueue(job) {
        try {
            await this.pubsubService.publishJobMessage(job);
            logger_1.logger.info('Job published to queue successfully', { jobId: job.id });
        }
        catch (error) {
            logger_1.logger.error('Failed to publish job to queue', { jobId: job.id, error });
            throw new Error(`Failed to publish job to queue: ${error}`);
        }
    }
    async updateJobStatus(jobId, status) {
        try {
            await this.firestoreService.updateJobStatus(jobId, status);
            logger_1.logger.info('Job status updated successfully', { jobId, status });
        }
        catch (error) {
            logger_1.logger.error('Failed to update job status', { jobId, status, error });
            throw new Error(`Failed to update job status: ${error}`);
        }
    }
}
exports.JobService = JobService;
//# sourceMappingURL=jobService.js.map