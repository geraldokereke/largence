import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class KafkaService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private kafka;
    private producer;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishEvent(topic: string, payload: any): Promise<void>;
}
