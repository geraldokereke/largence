import { Injectable } from '@nestjs/common';
import { OrgTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface FeatureLimits {
  activeWorkspaces: number;
  activeMatters: number;
  timeTracking: boolean;
  billing: boolean;
}

export const TIER_LIMITS: Record<OrgTier, FeatureLimits> = {
  [OrgTier.FREE]: {
    activeWorkspaces: 0,
    activeMatters: 1,
    timeTracking: false,
    billing: false,
  },
  [OrgTier.LEARN]: {
    activeWorkspaces: 1,
    activeMatters: 5,
    timeTracking: true,
    billing: false,
  },
  [OrgTier.EDGE]: {
    activeWorkspaces: 1,
    activeMatters: 25,
    timeTracking: true,
    billing: true,
  },
  [OrgTier.VERTEX]: {
    activeWorkspaces: 10,
    activeMatters: 100,
    timeTracking: true,
    billing: true,
  },
  [OrgTier.ZENITH]: {
    activeWorkspaces: Infinity,
    activeMatters: Infinity,
    timeTracking: true,
    billing: true,
  },
};

@Injectable()
export class TierService {
  constructor(private prisma: PrismaService) {}

  getLimits(tier: OrgTier): FeatureLimits {
    return TIER_LIMITS[tier];
  }

  async canCreateActiveMatters(orgId: string, tier: OrgTier): Promise<boolean> {
    const limits = this.getLimits(tier);
    if (limits.activeMatters === Infinity) return true;

    const count = await this.prisma.matter.count({
      where: { orgId, status: { not: 'ARCHIVED' } },
    });

    return count < limits.activeMatters;
  }

  async canCreateActiveWorkspaces(orgId: string, tier: OrgTier): Promise<boolean> {
    const limits = this.getLimits(tier);
    console.log(
      `[TierService] Checking workspace limit for org ${orgId}. Tier: ${tier}, Limit: ${limits.activeWorkspaces}`,
    );

    if (limits.activeWorkspaces === Infinity) return true;

    const count = await this.prisma.workspace.count({
      where: { orgId, status: { not: 'ARCHIVED' } },
    });

    console.log(`[TierService] Current active workspaces: ${count}`);
    return count < limits.activeWorkspaces;
  }
}
