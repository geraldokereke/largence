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
exports.TenantResolverMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let TenantResolverMiddleware = class TenantResolverMiddleware {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async use(req, res, next) {
        const host = req.headers.host || '';
        const baseDomain = process.env.BASE_DOMAIN || 'largence.com';
        let subdomain = '';
        if (host.includes(baseDomain)) {
            subdomain = host.split(`.${baseDomain}`)[0];
        }
        if (!subdomain || subdomain === 'app' || subdomain === 'www') {
            req.isPublicTenant = true;
            return next();
        }
        const cacheKey = `org:slug:${subdomain}`;
        let org = await this.redis.getJson(cacheKey);
        if (!org) {
            org = await this.prisma.organisation.findUnique({
                where: { slug: subdomain },
            });
            if (org) {
                await this.redis.setJson(cacheKey, org, 300);
            }
        }
        if (!org) {
            throw new common_1.NotFoundException('ORGANISATION_NOT_FOUND');
        }
        if (!org.isActive) {
            throw new common_1.ForbiddenException('ORGANISATION_SUSPENDED');
        }
        req.org = org;
        next();
    }
};
exports.TenantResolverMiddleware = TenantResolverMiddleware;
exports.TenantResolverMiddleware = TenantResolverMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], TenantResolverMiddleware);
//# sourceMappingURL=tenant-resolver.middleware.js.map