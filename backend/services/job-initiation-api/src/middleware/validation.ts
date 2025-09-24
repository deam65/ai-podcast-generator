import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

const createJobSchema = Joi.object({  
  categories: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.base': 'categories must be an array',
      'array.min': 'At least one topic is required',
      'array.max': 'Cannot specify more than 10 categories',
      'string.empty': 'Topic cannot be empty',
      'string.max': 'Topic cannot exceed 100 characters'
    })
});

export const validateCreateJob = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createJobSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    logger.warn('Validation failed for job creation', { 
      errors: errorMessages, 
      body: req.body 
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errorMessages
    });
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

export const validateJobId = (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(jobId)) {
    return res.status(400).json({
      error: 'Invalid job ID format'
    });
  }
  
  next();
};
