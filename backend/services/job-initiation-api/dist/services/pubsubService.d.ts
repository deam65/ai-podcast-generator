import { Job } from '../models/job';
export declare class PubSubService {
    private pubsub;
    private topicName;
    constructor();
    publishJobMessage(job: Job): Promise<void>;
}
//# sourceMappingURL=pubsubService.d.ts.map