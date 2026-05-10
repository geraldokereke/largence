import { Injectable } from '@nestjs/common';
import { OnboardingMode, OrgTier, OrgType } from '@prisma/client';
import { SlugUtil } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async createOrganisation(data: {
    name: string;
    type: OrgType;
    tier: OrgTier;
    onboardingMode: OnboardingMode;
  }) {
    let slug = SlugUtil.generateSlug(data.name);
    const existing = await this.prisma.organisation.findUnique({ where: { slug } });
    if (existing) {
      slug = SlugUtil.appendSuffix(slug);
    }

    return this.prisma.organisation.create({
      data: {
        ...data,
        slug,
      },
    });
  }
}
