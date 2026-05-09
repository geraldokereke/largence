import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

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

  async publishEvent(topic: string, payload: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (error) {
      this.logger.warn(`Kafka failed, falling back to DB for audit: ${topic}`);
      
      // Fallback to DB if topic is audit related
      if (topic.includes('audit')) {
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
            metadata: payload.metadata,
          },
        });
      }
    }
  }
}
