import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa.dto';
import { Organisation, User } from "@prisma/client";
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        userId: string;
        orgSlug: string;
        subDomain: string;
    }>;
    login(dto: LoginDto, org: Organisation, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | {
        requiresMfa: boolean;
        mfaToken: string;
    }>;
    mfaVerify(dto: MfaVerifyDto, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(req: Request, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: User): Promise<{
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
    health(): {
        status: string;
    };
}
