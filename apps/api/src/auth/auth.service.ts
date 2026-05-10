import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthProvider,
  OnboardingMode,
  Organisation,
  OrgTier,
  OrgType,
  Prisma,
  Role,
  User,
  UserTier,
} from '@prisma/client';
import { SlugUtil } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { CryptoService } from './crypto.service';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './email.service';
import { MfaService } from './mfa.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export interface SocialProfile {
  id: string;
  emails: { value: string }[];
  name: {
    givenName: string;
    familyName: string;
  };
}

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

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('EMAIL_ALREADY_REGISTERED');
    }

    const slug = SlugUtil.generateSlug(dto.orgName);
    const existingOrg = await this.prisma.organisation.findUnique({ where: { slug } });

    // Phase 1 Check: If someone tries to "claim" an org that is INVITE_ONLY
    if (existingOrg && existingOrg.onboardingMode === OnboardingMode.INVITE_ONLY) {
      throw new ForbiddenException('REGISTRATION_INVITE_ONLY');
    }

    if (existingOrg) {
      throw new ConflictException('ORGANISATION_NAME_UNAVAILABLE');
    }

    try {
      const result = await this.prisma.$transaction(async tx => {
        const org = await tx.organisation.create({
          data: {
            name: dto.orgName,
            slug,
            type: dto.orgType,
            tier: dto.isSandbox ? OrgTier.ZENITH : OrgTier.FREE,
            onboardingMode: OnboardingMode.SELF_SERVE,
            isSandbox: dto.isSandbox || false,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
            tier: UserTier.EDGE,
          },
        });

        const token = this.crypto.generateSecureToken(32);
        await tx.emailVerificationToken.create({
          data: {
            userId: user.id,
            tokenHash: this.crypto.hashSha256(token),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        return { user, org, verificationToken: token };
      });

      await this.emailService.sendVerificationEmail(
        result.user.email,
        result.verificationToken,
        result.org.slug,
      );

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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('REGISTRATION_COLLISION_DETECTED');
      }
      throw error;
    }
  }

  async login(dto: LoginDto, resolvedOrg: Organisation | null, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        org: {
          include: { ssoConfigs: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // SSO Enforcement Check
    const activeSso = user.org.ssoConfigs.find(c => c.isActive);
    if (activeSso && !user.roles.includes(Role.PLATFORM_ADMIN)) {
      const ssoType = activeSso.protocol.toLowerCase();
      const ssoInitUrl = `https://${user.org.slug}.${process.env.BASE_DOMAIN}/auth/sso/${ssoType}`;
      throw new ForbiddenException({
        message: 'SSO_REQUIRED',
        ssoInitUrl,
      });
    }

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

    // MFA Enforcement Logic
    const isMfaRequired = user.org.mfaRequired || user.org.type === OrgType.GOVERNMENT;
    if (isMfaRequired && !user.mfaEnabled) {
      return { requiresMfaSetup: true };
    }

    if (user.mfaEnabled) {
      // Issue a very short-lived challenge token
      const dfp = this.tokenService.generateDeviceFingerprint(userAgent, ip);
      const mfaToken = await this.tokenService.issueAccessToken({
        sub: user.id,
        org: user.orgId,
        slug: user.org.slug,
        roles: user.roles,
        tier: user.tier,
        dfp,
        mfa_verified: false,
        mfa_pending: true,
      });

      return { requiresMfa: true, mfaToken };
    }

    return this.issueSession(user, ip, userAgent, dto.deviceId);
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.failedLoginAttempts + 1;
    let lockedUntil = null;
    if (attempts >= 10) {
      lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
  }

  async issueSession(
    user: User & { org: Organisation },
    ip: string,
    userAgent: string,
    deviceId?: string,
  ) {
    const dfp = this.tokenService.generateDeviceFingerprint(userAgent, ip);
    const accessToken = await this.tokenService.issueAccessToken({
      sub: user.id,
      org: user.orgId,
      slug: user.org.slug,
      roles: user.roles,
      tier: user.tier,
      dfp,
      mfa_verified: user.mfaEnabled,
    });

    const refreshToken = await this.tokenService.issueRefreshToken(
      user.id,
      user.orgId,
      deviceId,
      userAgent,
      ip,
    );

    return { accessToken, refreshToken };
  }

  async mfaVerify(dto: MfaVerifyDto, ip: string, userAgent: string) {
    let payload;
    try {
      payload = await this.tokenService.verifyToken(dto.mfaToken);
    } catch {
      throw new UnauthorizedException('INVALID_MFA_CHALLENGE');
    }

    if (!payload.mfa_pending) {
      throw new UnauthorizedException('INVALID_MFA_CHALLENGE');
    }

    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { org: true },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA_NOT_ENABLED');
    }

    const isValid = this.mfa.verifyTotp(dto.token, user.mfaSecret);
    if (!isValid) {
      const isBackup = await this.mfa.verifyBackupCode(userId, dto.token);
      if (!isBackup) {
        throw new UnauthorizedException('INVALID_MFA_CODE');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    return this.issueSession(user, ip, userAgent);
  }

  async refreshTokens(refreshToken: string, ip: string, userAgent: string) {
    const tokenHash = this.crypto.hashSha256(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { org: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      if (storedToken?.usedAt) {
        await this.prisma.refreshToken.updateMany({
          where: { family: storedToken.family },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('TOKEN_FAMILY_REVOKED');
      }
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    return this.issueSession(storedToken.user, ip, userAgent, storedToken.deviceId || undefined);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.crypto.hashSha256(refreshToken);
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string, orgSlug: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { org: true },
    });

    if (!user || user.org.slug !== orgSlug) {
      return;
    }

    const token = this.crypto.generateSecureToken(32);
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.crypto.hashSha256(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, token, user.org.slug);
  }

  async verifyEmail(token: string) {
    const tokenHash = this.crypto.hashSha256(token);
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return { message: 'EMAIL_VERIFIED_SUCCESSFULLY' };
  }

  async setupMfa(user: User) {
    const secret = this.mfa.generateSecret();
    const qrCode = await this.mfa.generateQr(user.email, secret);

    return { secret, qrCode };
  }

  async enableMfa(user: User, token: string, secret: string) {
    const isValid = this.mfa.verifyTotp(token, secret);
    if (!isValid) {
      throw new BadRequestException('INVALID_MFA_TOKEN');
    }

    const backupCodes = await this.mfa.generateBackupCodes(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaEnabledAt: new Date(),
      },
    });

    return { backupCodes };
  }

  async validateSocialLogin(profile: SocialProfile, provider: string, orgSlug: string) {
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;

    const org = await this.prisma.organisation.findUnique({
      where: { slug: orgSlug },
    });

    if (!org) {
      throw new BadRequestException('INVALID_ORGANISATION');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { org: true },
    });

    if (!user) {
      // JIT Provisioning (Just-In-Time)
      const newUser = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          orgId: org.id,
          roles: [Role.FEE_EARNER], // Default role for social logins
          tier: UserTier.EDGE,
          provider: provider.toUpperCase() as AuthProvider,
          providerId: profile.id,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        include: { org: true },
      });
      user = newUser;
    }

    return user;
  }

  async loginSocial(user: User & { org: Organisation }, ip: string, userAgent: string) {
    const tokens = await this.issueSession(user, ip, userAgent);

    await this.audit.log({
      userId: user.id,
      orgId: user.orgId,
      action: 'USER_LOGIN_SOCIAL',
      result: 'SUCCESS',
      ip,
      userAgent,
    });

    return tokens;
  }
}
