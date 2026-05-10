import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { CHECK_TIER_KEY } from '../decorators/check-tier.decorator';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { TierService } from '../services/tier.service';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private tierService: TierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitKey = this.reflector.get<string>(CHECK_TIER_KEY, context.getHandler());

    if (!limitKey) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user?.orgId) {
      throw new ForbiddenException('ORGANISATION_CONTEXT_MISSING');
    }

    const org = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: user.orgId },
      select: { tier: true },
    });

    let allowed = true;

    if (limitKey === 'activeMatters') {
      allowed = await this.tierService.canCreateActiveMatters(user.orgId, org.tier);
    } else if (limitKey === 'activeWorkspaces') {
      allowed = await this.tierService.canCreateActiveWorkspaces(user.orgId, org.tier);
    } else {
      const limits = this.tierService.getLimits(org.tier);
      allowed = limits[limitKey as keyof typeof limits] as boolean;
    }

    if (!allowed) {
      throw new ForbiddenException({
        code: 'TIER_LIMIT_EXCEEDED',
        message: `Your current tier does not allow this action or you have reached your limit.`,
        limitKey,
      });
    }

    return true;
  }
}
