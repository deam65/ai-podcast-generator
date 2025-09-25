import { Logging } from '@google-cloud/logging';

require('dotenv').config();

const SERVICE_NAME = process.env.SERVICE_NAME || 'content-retrieval-service';

// Initialize Google Cloud Logging
const logging = new Logging();
const log = logging.log(SERVICE_NAME);

interface LogMetadata {
  [key: string]: any;
}

export const logger = {
  info: (message: string, meta?: LogMetadata) => {
    const entry = log.entry(
      {
        severity: 'INFO',
        timestamp: new Date(),
      },
      {
        message,
        service: SERVICE_NAME,
        ...meta,
      }
    );
    log.write(entry);
  },

  error: (message: string, error?: any) => {
    const entry = log.entry(
      {
        severity: 'ERROR',
        timestamp: new Date(),
      },
      {
        message,
        service: SERVICE_NAME,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      }
    );
    log.write(entry);
  },

  warn: (message: string, meta?: LogMetadata) => {
    const entry = log.entry(
      {
        severity: 'WARNING',
        timestamp: new Date(),
      },
      {
        message,
        service: SERVICE_NAME,
        ...meta,
      }
    );
    log.write(entry);
  },

  debug: (message: string, meta?: LogMetadata) => {
    const entry = log.entry(
      {
        severity: 'DEBUG',
        timestamp: new Date(),
      },
      {
        message,
        service: SERVICE_NAME,
        ...meta,
      }
    );
    log.write(entry);
  },
};
