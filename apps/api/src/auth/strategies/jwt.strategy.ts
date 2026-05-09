import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService, AccessTokenPayload } from '../token.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_PUBLIC_KEY || 'MISSING_KEY',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: AccessTokenPayload) {
    // Check jti blacklist
    const isBlacklisted = await this.tokenService.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('TOKEN_REVOKED');
    }

    // Check user and org status
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { org: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('USER_INACTIVE');
    }

    if (!user.org.isActive) {
      throw new ForbiddenException('ORGANISATION_SUSPENDED');
    }

    // Verify orgId in token matches user's current org
    if (user.orgId !== payload.org) {
      throw new ForbiddenException('ORG_MISMATCH');
    }

    return user;
  }
}
