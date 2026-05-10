import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, UserTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from './crypto.service';

export interface AccessTokenPayload {
  sub: string;
  org: string; // orgId
  slug: string; // orgSlug
  roles: Role[];
  tier: UserTier;
  jti: string;
  dfp: string; // Device Fingerprint
  mfa_verified: boolean;
  mfa_pending?: boolean;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private redis: RedisService,
    private crypto: CryptoService,
    private prisma: PrismaService,
  ) {}

  async issueAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): Promise<string> {
    const jti = this.crypto.generateSecureToken(16);
    return this.jwtService.signAsync(
      { ...payload, jti },
      {
        expiresIn: (payload.mfa_pending
          ? '5m'
          : process.env.JWT_ACCESS_TTL || '15m') as unknown as number,
        algorithm: 'RS256',
      },
    );
  }

  async issueRefreshToken(
    userId: string,
    orgId: string,
    deviceId?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const rawToken = this.crypto.generateSecureToken(64);
    const tokenHash = this.crypto.hashSha256(rawToken);
    const family = this.crypto.generateSecureToken(16);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        family,
        userId,
        orgId,
        deviceId,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return rawToken;
  }

  async verifyToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      algorithms: ['RS256'],
    });
  }

  async blacklistJti(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`blacklist:jti:${jti}`, '1', ttlSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:jti:${jti}`);
    return !!result;
  }

  generateDeviceFingerprint(userAgent: string, ip: string): string {
    const ipSubnet = ip.split('.').slice(0, 3).join('.');
    return this.crypto.hashSha256(`${userAgent}:${ipSubnet}`);
  }
}
