import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { MfaService } from './mfa.service';
import { CryptoService } from './crypto.service';
import { SlugUtil } from '../common/utils/slug.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Organisation, User, Role, UserTier, OrgTier, OnboardingMode } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private audit: AuditService,
    private mfa: MfaService,
    private crypto: CryptoService,
  ) {}

  async register(dto: RegisterDto) {
    this.passwordService.validateStrength(dto.password, [dto.firstName, dto.lastName, dto.orgName]);

    // Generate unique slug
    let slug = SlugUtil.generateSlug(dto.orgName);
    const existingOrg = await this.prisma.organisation.findUnique({ where: { slug } });
    if (existingOrg) {
      slug = SlugUtil.appendSuffix(slug);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: {
          name: dto.orgName,
          slug,
          type: dto.orgType,
          tier: dto.isSandbox ? OrgTier.ZENITH : OrgTier.FREE,
          onboardingMode: OnboardingMode.SELF_SERVE,
          isSandbox: dto.isSandbox || false,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });

      const passwordHash = await this.passwordService.hash(dto.password);
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          orgId: org.id,
          roles: [Role.ORG_ADMIN],
          tier: UserTier.EDGE, // Default tier
        },
      });

      const token = this.crypto.generateSecureToken(32);
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: this.crypto.hashSha256(token),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });

      return { user, org, verificationToken: token };
    });

    await this.emailService.sendVerificationEmail(result.user.email, result.verificationToken, result.org.slug);
    
    await this.audit.log({
      userId: result.user.id,
      orgId: result.org.id,
      orgSlug: result.org.slug,
      action: 'USER_REGISTERED',
      result: 'SUCCESS',
    });

    return {
      userId: result.user.id,
      orgSlug: result.org.slug,
      subDomain: `${result.org.slug}.${process.env.BASE_DOMAIN}`,
    };
  }

  async login(dto: LoginDto, resolvedOrg: Organisation | null, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { org: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Tenant Check: user must belong to the resolved org
    if (resolvedOrg && user.orgId !== resolvedOrg.id) {
      throw new ForbiddenException('ORG_MISMATCH');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('ACCOUNT_LOCKED');
    }

    const isMatch = await this.passwordService.verify(user.passwordHash!, dto.password);
    if (!isMatch) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('EMAIL_NOT_VERIFIED');
    }

    if (user.mfaEnabled) {
      const mfaToken = this.crypto.generateSecureToken(32);
      // Store mfaToken in Redis for 10 min
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
      });
      
      return { requiresMfa: true, mfaToken };
    }

    return this.issueSession(user, ip, userAgent, dto.deviceId);
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.failedLoginAttempts + 1;
    let lockedUntil = null;
    if (attempts >= 10) {
      lockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lockout
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
  }

  async issueSession(user: User & { org: Organisation }, ip: string, userAgent: string, deviceId?: string) {
    const dfp = this.tokenService.generateDeviceFingerprint(userAgent, ip);
    const accessToken = await this.tokenService.issueAccessToken({
      sub: user.id,
      org: user.orgId,
      slug: user.org.slug,
      roles: user.roles,
      tier: user.tier,
      dfp,
      mfa_verified: false, // Initial login is false until confirmed if needed, but here it's simple session
    });

    const refreshToken = await this.tokenService.issueRefreshToken(user.id, user.orgId, deviceId, userAgent, ip);

    return { accessToken, refreshToken };
  }

  async mfaVerify(token: string, userId: string, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { org: true },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA_NOT_ENABLED');
    }

    const isValid = this.mfa.verifyTotp(token, user.mfaSecret);
    if (!isValid) {
      const isBackup = await this.mfa.verifyBackupCode(userId, token);
      if (!isBackup) {
        throw new UnauthorizedException('INVALID_MFA_CODE');
      }
    }

    const session = await this.issueSession(user, ip, userAgent);
    
    // Update access token with mfa_verified: true
    const dfp = this.tokenService.generateDeviceFingerprint(userAgent, ip);
    const accessToken = await this.tokenService.issueAccessToken({
      sub: user.id,
      org: user.orgId,
      slug: user.org.slug,
      roles: user.roles,
      tier: user.tier,
      dfp,
      mfa_verified: true,
    });

    return { ...session, accessToken };
  }

  async refreshTokens(refreshToken: string, ip: string, userAgent: string) {
    const tokenHash = this.crypto.hashSha256(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { org: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      if (storedToken?.usedAt) {
        // Reuse detected -> Revoke family
        await this.prisma.refreshToken.updateMany({
          where: { family: storedToken.family },
          data: { revokedAt: new Date() },
        });
        await this.audit.log({
          userId: storedToken.userId,
          action: 'TOKEN_REUSE_DETECTED',
          result: 'SECURITY_ALERT',
          metadata: { family: storedToken.family },
        });
        throw new UnauthorizedException('TOKEN_FAMILY_REVOKED');
      }
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    // Mark as used
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    return this.issueSession(storedToken.user, ip, userAgent, storedToken.deviceId || undefined);
  }

  async forgotPassword(email: string, orgSlug: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { org: true },
    });

    if (!user || user.org.slug !== orgSlug) {
      // Avoid enumeration
      return;
    }

    const token = this.crypto.generateSecureToken(32);
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.crypto.hashSha256(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, token, user.org.slug);
  }
}
