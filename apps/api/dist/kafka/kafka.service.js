"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const prisma_service_1 = require("../prisma/prisma.service");
let KafkaService = KafkaService_1 = class KafkaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(KafkaService_1.name);
        this.kafka = new kafkajs_1.Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'largence-auth',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        this.producer = this.kafka.producer();
    }
    async onModuleInit() {
        try {
            await this.producer.connect();
            this.logger.log('Kafka Producer connected');
        }
        catch (error) {
            this.logger.error('Failed to connect Kafka Producer', error);
        }
    }
    async onModuleDestroy() {
        await this.producer.disconnect();
    }
    async publishEvent(topic, payload) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(payload) }],
            });
        }
        catch (error) {
            this.logger.warn(`Kafka failed, falling back to DB for audit: ${topic}`);
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
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KafkaService);
//# sourceMappingURL=kafka.service.js.map