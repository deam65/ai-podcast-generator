import { Firestore, Timestamp } from '@google-cloud/firestore';
import { Job } from '../models/job';
import { logger } from '../utils/logger';
require('dotenv').config();

export class FirestoreService {
    private firestore: Firestore;
    private collectionName: string;
    
    constructor() {
        try {
            this.firestore = new Firestore({
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
            });

            this.collectionName = process.env.FIRESTORE_JOBS_COLLECTION || 'jobs';

            logger.info('FirestoreService initialized', { 
                collectionName: this.collectionName 
            });
        } catch (e) {
            logger.error('Failed to initialize Firestore', e);
            throw new Error('Firestore initialization failed');
        }
    }

    async createJob(job: Job): Promise<Job> {
        try {
            const jobDoc = {
                id: job.id,
                numArticles: job.numArticles,
                topics: job.topics,
                source: job.source,
                status: job.status,
                createdAt: Timestamp.fromDate(job.createdAt),
                updatedAt: Timestamp.fromDate(job.updatedAt),
                sseEndpoint: job.sseEndpoint
            };

            await this.firestore
                .collection(this.collectionName)
                .doc(job.id)
                .set(jobDoc);

            logger.info('Job created in Firestore', { jobId: job.id });
            return job;
        } catch (error) {
            logger.error('Failed to create job in Firestore', { jobId: job.id, error });
            throw new Error(`Failed to create job: ${error}`);
        }
    }

    async getJob(jobId: string): Promise<Job | null> {
        try {
            const jobDoc = await this.firestore
                .collection(this.collectionName)
                .doc(jobId)
                .get();
            
            if (!jobDoc.exists) {
                logger.info('Job not found in Firestore', { jobId });
                return null;
            }

            const data = jobDoc.data();

            if (!data) {
                logger.warn('Job document exists but has no data', { jobId });
                return null;
            }

            const job: Job = {
                id: data.id,
                numArticles: data.numArticles,
                topics: data.topics,
                source: data.source,
                status: data.status,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
                sseEndpoint: data.sseEndpoint
            };

            logger.info('Job retrieved successfully from Firestore', { jobId });
            return job;
        } catch (error) {
            logger.error('Failed to get job from Firestore', { jobId: jobId, error });
            throw new Error(`Failed to get job: ${error}`);
        }
    }

    async updateJobStatus(jobId: string, status: string): Promise<void> {
        try {
            await this.firestore
                .collection(this.collectionName)
                .doc(jobId)
                .update({
                    status: status,
                    updatedAt: Timestamp.now()
                });

            logger.info('Job status updated in Firestore', { jobId, status });
        } catch (error) {
            logger.error('Failed to update job status in Firestore', { jobId, status, error });
            throw new Error(`Failed to update job status: ${error}`);
        }
    }
}


