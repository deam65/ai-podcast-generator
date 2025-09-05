import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

const createJobSchema = Joi.object({
  numArticles: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'numArticles must be a positive integer',
      'number.integer': 'numArticles must be a positive integer',
      'number.min': 'numArticles must be a positive integer',
      'number.max': 'numArticles cannot exceed 50',
      'any.required': 'numArticles is required'
    }),
  
  topics: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.base': 'topics must be an array',
      'array.min': 'At least one topic is required',
      'array.max': 'Cannot specify more than 10 topics',
      'string.empty': 'Topic cannot be empty',
      'string.max': 'Topic cannot exceed 100 characters'
    }),
  
  source: Joi.string()
    .valid('news', 'twitter', 'reddit')
    .required()
    .messages({
      'any.only': 'source must be one of: news, twitter, reddit',
      'any.required': 'source is required'
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
