"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobId = exports.validateCreateJob = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../utils/logger");
const createJobSchema = joi_1.default.object({
    numArticles: joi_1.default.number()
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
    topics: joi_1.default.array()
        .items(joi_1.default.string().trim().min(1).max(100))
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
    source: joi_1.default.string()
        .valid('news', 'twitter', 'reddit')
        .required()
        .messages({
        'any.only': 'source must be one of: news, twitter, reddit',
        'any.required': 'source is required'
    })
});
const validateCreateJob = (req, res, next) => {
    const { error, value } = createJobSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        logger_1.logger.warn('Validation failed for job creation', {
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
exports.validateCreateJob = validateCreateJob;
const validateJobId = (req, res, next) => {
    const { jobId } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
        return res.status(400).json({
            error: 'Invalid job ID format'
        });
    }
    next();
};
exports.validateJobId = validateJobId;
//# sourceMappingURL=validation.js.map