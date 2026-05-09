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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const email_service_1 = require("./email.service");
const audit_service_1 = require("./audit.service");
const mfa_service_1 = require("./mfa.service");
const crypto_service_1 = require("./crypto.service");
const slug_util_1 = require("../common/utils/slug.util");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, passwordService, tokenService, emailService, audit, mfa, crypto) {
        this.prisma = prisma;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.audit = audit;
        this.mfa = mfa;
        this.crypto = crypto;
    }
    async register(dto) {
        this.passwordService.validateStrength(dto.password, [dto.firstName, dto.lastName, dto.orgName]);
        let slug = slug_util_1.SlugUtil.generateSlug(dto.orgName);
        const existingOrg = await this.prisma.organisation.findUnique({ where: { slug } });
        if (existingOrg) {
            slug = slug_util_1.SlugUtil.appendSuffix(slug);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const org = await tx.organisation.create({
                data: {
                    name: dto.orgName,
                    slug,
                    type: dto.orgType,
                    tier: dto.isSandbox ? client_1.OrgTier.ZENITH : client_1.OrgTier.FREE,
                    onboardingMode: client_1.OnboardingMode.SELF_SERVE,
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
                    roles: [client_1.Role.ORG_ADMIN],
                    tier: client_1.UserTier.EDGE,
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
    async login(dto, resolvedOrg, ip, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { org: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('INVALID_CREDENTIALS');
        }
        if (resolvedOrg && user.orgId !== resolvedOrg.id) {
            throw new common_1.ForbiddenException('ORG_MISMATCH');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException('ACCOUNT_LOCKED');
        }
        const isMatch = await this.passwordService.verify(user.passwordHash, dto.password);
        if (!isMatch) {
            await this.handleFailedLogin(user);
            throw new common_1.UnauthorizedException('INVALID_CREDENTIALS');
        }
        if (!user.emailVerified) {
            throw new common_1.ForbiddenException('EMAIL_NOT_VERIFIED');
        }
        if (user.mfaEnabled) {
            const mfaToken = this.crypto.generateSecureToken(32);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
            });
            return { requiresMfa: true, mfaToken };
        }
        return this.issueSession(user, ip, userAgent, dto.deviceId);
    }
    async handleFailedLogin(user) {
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
    async issueSession(user, ip, userAgent, deviceId) {
        const dfp = this.tokenService.generateDeviceFingerprint(userAgent, ip);
        const accessToken = await this.tokenService.issueAccessToken({
            sub: user.id,
            org: user.orgId,
            slug: user.org.slug,
            roles: user.roles,
            tier: user.tier,
            dfp,
            mfa_verified: false,
        });
        const refreshToken = await this.tokenService.issueRefreshToken(user.id, user.orgId, deviceId, userAgent, ip);
        return { accessToken, refreshToken };
    }
    async mfaVerify(token, userId, ip, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { org: true },
        });
        if (!user || !user.mfaSecret) {
            throw new common_1.UnauthorizedException('MFA_NOT_ENABLED');
        }
        const isValid = this.mfa.verifyTotp(token, user.mfaSecret);
        if (!isValid) {
            const isBackup = await this.mfa.verifyBackupCode(userId, token);
            if (!isBackup) {
                throw new common_1.UnauthorizedException('INVALID_MFA_CODE');
            }
        }
        const session = await this.issueSession(user, ip, userAgent);
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
    async refreshTokens(refreshToken, ip, userAgent) {
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
                await this.audit.log({
                    userId: storedToken.userId,
                    action: 'TOKEN_REUSE_DETECTED',
                    result: 'SECURITY_ALERT',
                    metadata: { family: storedToken.family },
                });
                throw new common_1.UnauthorizedException('TOKEN_FAMILY_REVOKED');
            }
            throw new common_1.UnauthorizedException('INVALID_REFRESH_TOKEN');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { usedAt: new Date() },
        });
        return this.issueSession(storedToken.user, ip, userAgent, storedToken.deviceId || undefined);
    }
    async forgotPassword(email, orgSlug) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService,
        token_service_1.TokenService,
        email_service_1.EmailService,
        audit_service_1.AuditService,
        mfa_service_1.MfaService,
        crypto_service_1.CryptoService])
], AuthService);
//# sourceMappingURL=auth.service.js.map