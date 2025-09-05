import { app } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Job Initiation API server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
