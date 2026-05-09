import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuditService {
  constructor(private kafka: KafkaService) {}

  async log(event: {
    userId?: string;
    orgId?: string;
    orgSlug?: string;
    action: string;
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    result: string;
    metadata?: any;
  }) {
    const payload = {
      ...event,
      timestamp: Date.now() * 1000000,
    };

    await this.kafka.publishEvent('auth.audit.events', payload);
  }
}
