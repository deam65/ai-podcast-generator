import { Job } from '../models/job';
export declare class FirestoreService {
    private firestore;
    private collectionName;
    constructor();
    createJob(job: Job): Promise<Job>;
    getJob(jobId: string): Promise<Job | null>;
    updateJobStatus(jobId: string, status: string): Promise<void>;
}
//# sourceMappingURL=firestoreService.d.ts.map