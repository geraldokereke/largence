import { KafkaService } from '../kafka/kafka.service';
export declare class AuditService {
    private kafka;
    constructor(kafka: KafkaService);
    log(event: {
        userId?: string;
        orgId?: string;
        orgSlug?: string;
        action: string;
        ip?: string;
        userAgent?: string;
        deviceId?: string;
        result: string;
        metadata?: any;
    }): Promise<void>;
}
