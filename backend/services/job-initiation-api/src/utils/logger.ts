require('dotenv').config();

const SERVICE_NAME = process.env.SERVICE_NAME;

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[${SERVICE_NAME}] [INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[${SERVICE_NAME}] [ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[${SERVICE_NAME}] [WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[${SERVICE_NAME}] [DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
  }
};
