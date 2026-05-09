import { Strategy } from 'passport-jwt';
import { TokenService, AccessTokenPayload } from '../token.service';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private tokenService;
    private prisma;
    constructor(tokenService: TokenService, prisma: PrismaService);
    validate(payload: AccessTokenPayload): Promise<{
        org: {
            type: import("@prisma/client").$Enums.OrgType;
            slug: string;
            tier: import("@prisma/client").$Enums.OrgTier;
            id: string;
            createdAt: Date;
            name: string;
            metadata: import("src/prisma/client/runtime/library").JsonValue | null;
            isSandbox: boolean;
            onboardingMode: import("@prisma/client").$Enums.OnboardingMode;
            mfaRequired: boolean;
            trialEndsAt: Date | null;
            scimEnabled: boolean;
            scimApiKey: string | null;
            dataResidency: string;
            isActive: boolean;
            updatedAt: Date;
        };
    } & {
        roles: import("@prisma/client").$Enums.Role[];
        tier: import("@prisma/client").$Enums.UserTier;
        id: string;
        createdAt: Date;
        orgId: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        updatedAt: Date;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        passwordHash: string | null;
        mfaEnabled: boolean;
        mfaSecret: string | null;
        mfaEnabledAt: Date | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
        provider: import("@prisma/client").$Enums.AuthProvider;
        providerId: string | null;
        externalId: string | null;
    }>;
}
export {};
