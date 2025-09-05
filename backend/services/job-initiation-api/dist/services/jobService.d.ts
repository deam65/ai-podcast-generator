import { Job } from "../models/job";
export declare class JobService {
    private firestoreService;
    private pubsubService;
    constructor();
    createJob(job: Job): Promise<Job>;
    getJob(jobId: string): Promise<Job | null>;
    publishJobToQueue(job: Job): Promise<void>;
    updateJobStatus(jobId: string, status: string): Promise<void>;
}
//# sourceMappingURL=jobService.d.ts.map