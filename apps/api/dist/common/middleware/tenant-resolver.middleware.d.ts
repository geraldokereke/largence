import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class TenantResolverMiddleware implements NestMiddleware {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
