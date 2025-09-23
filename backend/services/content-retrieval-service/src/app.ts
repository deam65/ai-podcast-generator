import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.npm_package_name || 'microservice'
  });
});

// Excluding routes because this microservice is event driven, 
// and should not be accessible through a REST endpoint

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
