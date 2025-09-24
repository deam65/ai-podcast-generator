import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JobService } from '../services/jobService';
import { CreateJobRequest, CreateJobResponse } from '../models/job';
import { logger } from '../utils/logger';

export class JobController {
  private jobService: JobService;
  private activeConnections: Map<string, Response> = new Map();

  constructor() {
    this.jobService = new JobService();
  }

  // Create new job
  createJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobRequest: CreateJobRequest = req.body;
      const jobId = uuidv4();
      const sseEndpoint = `/api/v1/jobs/${jobId}/events`;

      logger.info('Creating new job', { jobId, jobRequest });

      const job = await this.jobService.createJob({
        id: jobId,
        ...jobRequest,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        sseEndpoint
      });

      await this.jobService.publishJobToQueue(job);

      const response: CreateJobResponse = {
        jobId: job.id,
        sseEndpoint: job.sseEndpoint,
        status: job.status,
        createdAt: job.createdAt.toISOString()
      };

      logger.info('Job created successfully', { jobId, response });
      res.status(201).json(response);

    } catch (error) {
      logger.error('Failed to create job', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create job'
      });
    }
  };

  // Get job status
  getJob = async (req: Request, res: Response): Promise<void> => {
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
        categories: job.categories,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        sseEndpoint: job.sseEndpoint
      });

    } catch (error) {
      logger.error('Failed to get job', { jobId: req.params.jobId, error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve job'
      });
    }
  };

  // Server-Sent Events endpoint
  getJobEvents = async (req: Request, res: Response): Promise<void> => {
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
        logger.info('SSE client disconnected', { jobId });
        this.activeConnections.delete(jobId);
      });

      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        if (this.activeConnections.has(jobId)) {
          this.sendSSEMessage(res, 'heartbeat', { timestamp: new Date().toISOString() });
        } else {
          clearInterval(heartbeat);
        }
      }, 30000); // 30 seconds

    } catch (error) {
      logger.error('Failed to establish SSE connection', { jobId, error });
      res.status(500).json({
        error: 'Failed to establish event stream'
      });
    }
  };

  // Helper method to send SSE messages
  private sendSSEMessage(res: Response, event: string, data: any): void {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Method to broadcast updates to connected clients (called by job service)
  broadcastJobUpdate = (jobId: string, update: any): void => {
    const connection = this.activeConnections.get(jobId);
    if (connection) {
      this.sendSSEMessage(connection, 'update', update);
    }
  };
}
