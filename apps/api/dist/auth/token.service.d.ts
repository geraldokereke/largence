import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserTier } from "@prisma/client";
export interface AccessTokenPayload {
    sub: string;
    org: string;
    slug: string;
    roles: Role[];
    tier: UserTier;
    jti: string;
    dfp: string;
    mfa_verified: boolean;
}
export declare class TokenService {
    private jwtService;
    private redis;
    private crypto;
    private prisma;
    constructor(jwtService: JwtService, redis: RedisService, crypto: CryptoService, prisma: PrismaService);
    issueAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): Promise<string>;
    issueRefreshToken(userId: string, orgId: string, deviceId?: string, userAgent?: string, ipAddress?: string): Promise<string>;
    blacklistJti(jti: string, ttlSeconds: number): Promise<void>;
    isBlacklisted(jti: string): Promise<boolean>;
    generateDeviceFingerprint(userAgent: string, ip: string): string;
}
