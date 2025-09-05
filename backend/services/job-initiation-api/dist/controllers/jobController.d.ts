import { Request, Response } from 'express';
export declare class JobController {
    private jobService;
    private activeConnections;
    constructor();
    createJob: (req: Request, res: Response) => Promise<void>;
    getJob: (req: Request, res: Response) => Promise<void>;
    getJobEvents: (req: Request, res: Response) => Promise<void>;
    private sendSSEMessage;
    broadcastJobUpdate: (jobId: string, update: any) => void;
}
//# sourceMappingURL=jobController.d.ts.map