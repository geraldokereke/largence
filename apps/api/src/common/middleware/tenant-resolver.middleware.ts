import { ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Organisation } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const baseDomain = process.env.BASE_DOMAIN || 'largence.com';

    // Parse subdomain
    let subdomain = '';
    if (host.includes(baseDomain)) {
      subdomain = host.split(`.${baseDomain}`)[0];
    }

    // Handle public/self-serve subdomains (central hub)
    if (!subdomain || ['app', 'www', 'auth', 'api'].includes(subdomain)) {
      req.isPublicTenant = true;
      return next();
    }

    // Lookup organisation
    const cacheKey = `org:slug:${subdomain}`;
    let org = await this.redis.getJson<Organisation>(cacheKey);

    if (!org) {
      org = await this.prisma.organisation.findUnique({
        where: { slug: subdomain },
      });

      if (org) {
        // Cache for 5 minutes
        await this.redis.setJson(cacheKey, org, 300);
      }
    }

    if (!org) {
      throw new NotFoundException('ORGANISATION_NOT_FOUND');
    }

    if (!org.isActive) {
      throw new ForbiddenException('ORGANISATION_SUSPENDED');
    }

    req.org = org;
    next();
  }
}
