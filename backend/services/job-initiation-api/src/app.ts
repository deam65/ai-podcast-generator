import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { jobRoutes } from './routes/jobs';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'job-initiation-api'
  });
});

// API routes
app.use('/api/v1/jobs', jobRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
