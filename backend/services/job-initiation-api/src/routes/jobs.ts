import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { validateCreateJob } from '../middleware/validation';

const router = Router();
const jobController = new JobController();

router.post('/', validateCreateJob, jobController.createJob);

router.get('/:jobId', jobController.getJob);

router.get('/:jobId/events', jobController.getJobEvents);

export { router as jobRoutes };
