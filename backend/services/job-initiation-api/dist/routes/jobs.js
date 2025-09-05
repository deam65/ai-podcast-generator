"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const jobController_1 = require("../controllers/jobController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.jobRoutes = router;
const jobController = new jobController_1.JobController();
router.post('/', validation_1.validateCreateJob, jobController.createJob);
router.get('/:jobId', jobController.getJob);
router.get('/:jobId/events', jobController.getJobEvents);
//# sourceMappingURL=jobs.js.map