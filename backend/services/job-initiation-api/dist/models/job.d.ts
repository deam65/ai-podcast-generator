export interface Job {
    id: string;
    numArticles: number;
    topics: string[];
    source: 'news' | 'twitter' | 'reddit';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    sseEndpoint: string;
}
export interface CreateJobRequest {
    numArticles: number;
    topics: string[];
    source: 'news' | 'twitter' | 'reddit';
}
export interface CreateJobResponse {
    jobId: string;
    sseEndpoint: string;
    status: string;
    createdAt: string;
}
//# sourceMappingURL=job.d.ts.map