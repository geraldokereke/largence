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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const redis_service_1 = require("../redis/redis.service");
const crypto_service_1 = require("./crypto.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TokenService = class TokenService {
    constructor(jwtService, redis, crypto, prisma) {
        this.jwtService = jwtService;
        this.redis = redis;
        this.crypto = crypto;
        this.prisma = prisma;
    }
    async issueAccessToken(payload) {
        const jti = this.crypto.generateSecureToken(16);
        return this.jwtService.signAsync({ ...payload, jti }, {
            expiresIn: process.env.JWT_ACCESS_TTL || '15m',
            algorithm: 'RS256',
        });
    }
    async issueRefreshToken(userId, orgId, deviceId, userAgent, ipAddress) {
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
    async blacklistJti(jti, ttlSeconds) {
        await this.redis.set(`blacklist:jti:${jti}`, '1', ttlSeconds);
    }
    async isBlacklisted(jti) {
        const result = await this.redis.get(`blacklist:jti:${jti}`);
        return !!result;
    }
    generateDeviceFingerprint(userAgent, ip) {
        const ipSubnet = ip.split('.').slice(0, 3).join('.');
        return this.crypto.hashSha256(`${userAgent}:${ipSubnet}`);
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        redis_service_1.RedisService,
        crypto_service_1.CryptoService,
        prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map