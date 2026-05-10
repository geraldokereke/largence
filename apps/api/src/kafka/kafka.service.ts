import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Kafka, Producer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEventPayload {
  userId?: string;
  orgId?: string;
  orgSlug?: string;
  action: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  result: string;
  metadata?: Prisma.JsonValue;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaService.name);

  constructor(private prisma: PrismaService) {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'largence-auth',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishEvent(topic: string, payload: AuditEventPayload) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (error) {
      this.logger.error({
        type: 'KAFKA_FAILURE',
        message: 'Kafka producer failed, attempting database fallback',
        topic,
        error: (error as Error).message,
      });

      if (topic.includes('audit')) {
        try {
          await this.prisma.auditEvent.create({
            data: {
              userId: payload.userId,
              orgId: payload.orgId,
              orgSlug: payload.orgSlug,
              action: payload.action,
              ipAddress: payload.ip,
              userAgent: payload.userAgent,
              deviceId: payload.deviceId,
              result: payload.result,
              metadata: payload.metadata ?? Prisma.JsonNull,
            },
          });
        } catch (dbError) {
          this.logger.error({
            type: 'CRITICAL_AUDIT_FAILURE',
            message: 'Both Kafka and Database fallback failed for audit logging',
            error: (dbError as Error).message,
            payload,
          });
        }
      }
    }
  }
}
