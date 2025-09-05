"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreService = void 0;
const firestore_1 = require("@google-cloud/firestore");
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class FirestoreService {
    constructor() {
        try {
            this.firestore = new firestore_1.Firestore({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
            });
            this.collectionName = process.env.FIRESTORE_JOBS_COLLECTION || 'jobs';
            logger_1.logger.info('FirestoreService initialized', {
                collectionName: this.collectionName
            });
        }
        catch (e) {
            logger_1.logger.error('Failed to initialize Firestore', e);
            throw new Error('Firestore initialization failed');
        }
    }
    async createJob(job) {
        try {
            const jobDoc = {
                id: job.id,
                numArticles: job.numArticles,
                topics: job.topics,
                source: job.source,
                status: job.status,
                createdAt: firestore_1.Timestamp.fromDate(job.createdAt),
                updatedAt: firestore_1.Timestamp.fromDate(job.updatedAt),
                sseEndpoint: job.sseEndpoint
            };
            await this.firestore
                .collection(this.collectionName)
                .doc(job.id)
                .set(jobDoc);
            logger_1.logger.info('Job created in Firestore', { jobId: job.id });
            return job;
        }
        catch (error) {
            logger_1.logger.error('Failed to create job in Firestore', { jobId: job.id, error });
            throw new Error(`Failed to create job: ${error}`);
        }
    }
    async getJob(jobId) {
        try {
            const jobDoc = await this.firestore
                .collection(this.collectionName)
                .doc(jobId)
                .get();
            if (!jobDoc.exists) {
                logger_1.logger.info('Job not found in Firestore', { jobId });
                return null;
            }
            const data = jobDoc.data();
            if (!data) {
                logger_1.logger.warn('Job document exists but has no data', { jobId });
                return null;
            }
            const job = {
                id: data.id,
                numArticles: data.numArticles,
                topics: data.topics,
                source: data.source,
                status: data.status,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
                sseEndpoint: data.sseEndpoint
            };
            logger_1.logger.info('Job retrieved successfully from Firestore', { jobId });
            return job;
        }
        catch (error) {
            logger_1.logger.error('Failed to get job from Firestore', { jobId: jobId, error });
            throw new Error(`Failed to get job: ${error}`);
        }
    }
    async updateJobStatus(jobId, status) {
        try {
            await this.firestore
                .collection(this.collectionName)
                .doc(jobId)
                .update({
                status: status,
                updatedAt: firestore_1.Timestamp.now()
            });
            logger_1.logger.info('Job status updated in Firestore', { jobId, status });
        }
        catch (error) {
            logger_1.logger.error('Failed to update job status in Firestore', { jobId, status, error });
            throw new Error(`Failed to update job status: ${error}`);
        }
    }
}
exports.FirestoreService = FirestoreService;
//# sourceMappingURL=firestoreService.js.map