import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SsoService {
  constructor(private prisma: PrismaService) {}

  async getSamlConfig(orgSlug: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { slug: orgSlug },
      include: { ssoConfigs: true },
    });

    if (!org || org.ssoConfigs.length === 0) {
      throw new NotFoundException('SAML_NOT_CONFIGURED_FOR_ORG');
    }

    const config = org.ssoConfigs.find(c => c.protocol === 'SAML' && c.isActive);
    if (!config) {
      throw new NotFoundException('SAML_NOT_ACTIVE_FOR_ORG');
    }

    return {
      entryPoint: config.entryPoint,
      issuer: config.issuer || `https://${orgSlug}.${process.env.BASE_DOMAIN}`,
      cert: config.cert,
      callbackUrl: `https://api.${process.env.BASE_DOMAIN}/auth/sso/saml/callback`,
    };
  }
}
