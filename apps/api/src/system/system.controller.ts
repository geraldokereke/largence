import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardingMode, OrgTier, OrgType, Role, SSOProtocol } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SlugUtil } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('system')
@ApiBearerAuth()
@Controller('system')
@Roles(Role.PLATFORM_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemController {
  constructor(private prisma: PrismaService) {}

  @Get('organisations')
  @ApiOperation({
    summary: 'List all organisations on the platform',
    description: 'Administrative view of all registered law firms.',
  })
  async listOrganisations() {
    return this.prisma.organisation.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('organisations')
  @ApiOperation({
    summary: 'Manually create an organisation',
    description: 'Platform-level bypass for creating firms without the public registration flow.',
  })
  async createOrganisation(
    @Body()
    dto: {
      name: string;
      slug?: string;
      type: OrgType;
      tier: OrgTier;
      onboardingMode: OnboardingMode;
    },
  ) {
    const orgName: string = dto.name;
    const finalSlug: string = dto.slug || SlugUtil.generateSlug(orgName);

    return this.prisma.organisation.create({
      data: {
        name: orgName,
        slug: finalSlug,
        type: dto.type,
        tier: dto.tier,
        onboardingMode: dto.onboardingMode,
        dataResidency: 'eu-west-2',
      },
    });
  }

  @Get('organisations/:id')
  @ApiOperation({ summary: 'Get detailed organisation profile' })
  async getOrganisation(@Param('id') id: string) {
    return this.prisma.organisation.findUnique({
      where: { id },
      include: {
        users: true,
        ssoConfigs: true,
      },
    });
  }

  @Patch('organisations/:id/tier')
  @ApiOperation({
    summary: 'Update organisation tier',
    description: 'Upgrades or downgrades a firm (e.g., from EDGE to ZENITH).',
  })
  async updateTier(@Param('id') id: string, @Body('tier') tier: OrgTier) {
    return this.prisma.organisation.update({
      where: { id },
      data: { tier },
    });
  }

  @Post('organisations/:id/sso')
  @ApiOperation({
    summary: 'Configure SSO for an organisation',
    description: 'Sets up SAML or OpenID Connect parameters for enterprise firms.',
  })
  async configureSSO(
    @Param('id') id: string,
    @Body()
    dto: {
      protocol: SSOProtocol;
      entryPoint: string;
      cert: string;
      issuer: string;
    },
  ) {
    return this.prisma.sSOConfig.upsert({
      where: { orgId: id },
      create: {
        orgId: id,
        ...dto,
      },
      update: {
        ...dto,
      },
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  async getPlatformStats() {
    const [orgCount, userCount] = await Promise.all([
      this.prisma.organisation.count(),
      this.prisma.user.count(),
    ]);

    return {
      totalOrganisations: orgCount,
      totalUsers: userCount,
      timestamp: new Date(),
    };
  }
}
