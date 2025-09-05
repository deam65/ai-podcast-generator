"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const uuid_1 = require("uuid");
const jobService_1 = require("../services/jobService");
const logger_1 = require("../utils/logger");
class JobController {
    constructor() {
        this.activeConnections = new Map();
        // Create new job
        this.createJob = async (req, res) => {
            try {
                const jobRequest = req.body;
                const jobId = (0, uuid_1.v4)();
                const sseEndpoint = `/api/v1/jobs/${jobId}/events`;
                logger_1.logger.info('Creating new job', { jobId, jobRequest });
                // Create job in database
                const job = await this.jobService.createJob({
                    id: jobId,
                    ...jobRequest,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    sseEndpoint
                });
                // Publish message to content-retrieval queue
                await this.jobService.publishJobToQueue(job);
                const response = {
                    jobId: job.id,
                    sseEndpoint: job.sseEndpoint,
                    status: job.status,
                    createdAt: job.createdAt.toISOString()
                };
                logger_1.logger.info('Job created successfully', { jobId, response });
                res.status(201).json(response);
            }
            catch (error) {
                logger_1.logger.error('Failed to create job', error);
                res.status(500).json({
                    error: 'Internal server error',
                    message: 'Failed to create job'
                });
            }
        };
        // Get job status
        this.getJob = async (req, res) => {
            try {
                const { jobId } = req.params;
                const job = await this.jobService.getJob(jobId);
                if (!job) {
                    res.status(404).json({
                        error: 'Job not found',
                        jobId
                    });
                    return;
                }
                res.json({
                    jobId: job.id,
                    status: job.status,
                    numArticles: job.numArticles,
                    topics: job.topics,
                    source: job.source,
                    createdAt: job.createdAt.toISOString(),
                    updatedAt: job.updatedAt.toISOString(),
                    sseEndpoint: job.sseEndpoint
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to get job', { jobId: req.params.jobId, error });
                res.status(500).json({
                    error: 'Internal server error',
                    message: 'Failed to retrieve job'
                });
            }
        };
        // Server-Sent Events endpoint
        this.getJobEvents = async (req, res) => {
            const { jobId } = req.params;
            try {
                // Verify job exists
                const job = await this.jobService.getJob(jobId);
                if (!job) {
                    res.status(404).json({ error: 'Job not found' });
                    return;
                }
                // Set up SSE headers
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Cache-Control'
                });
                // Store connection for this job
                this.activeConnections.set(jobId, res);
                // Send initial status
                this.sendSSEMessage(res, 'status', {
                    jobId,
                    status: job.status,
                    timestamp: new Date().toISOString()
                });
                // Handle client disconnect
                req.on('close', () => {
                    logger_1.logger.info('SSE client disconnected', { jobId });
                    this.activeConnections.delete(jobId);
                });
                // Keep connection alive with periodic heartbeat
                const heartbeat = setInterval(() => {
                    if (this.activeConnections.has(jobId)) {
                        this.sendSSEMessage(res, 'heartbeat', { timestamp: new Date().toISOString() });
                    }
                    else {
                        clearInterval(heartbeat);
                    }
                }, 30000); // 30 seconds
            }
            catch (error) {
                logger_1.logger.error('Failed to establish SSE connection', { jobId, error });
                res.status(500).json({
                    error: 'Failed to establish event stream'
                });
            }
        };
        // Method to broadcast updates to connected clients (called by job service)
        this.broadcastJobUpdate = (jobId, update) => {
            const connection = this.activeConnections.get(jobId);
            if (connection) {
                this.sendSSEMessage(connection, 'update', update);
            }
        };
        this.jobService = new jobService_1.JobService();
    }
    // Helper method to send SSE messages
    sendSSEMessage(res, event, data) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}
exports.JobController = JobController;
//# sourceMappingURL=jobController.js.map