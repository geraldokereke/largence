import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { KafkaService } from '../kafka/kafka.service';

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
      eventId: randomUUID(),
    };

    await this.kafka.publishEvent('auth.audit.events', payload);
  }
}
