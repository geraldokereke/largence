import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { MfaService } from './mfa.service';
import { CryptoService } from './crypto.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Organisation, User } from "@prisma/client";
export declare class AuthService {
    private prisma;
    private passwordService;
    private tokenService;
    private emailService;
    private audit;
    private mfa;
    private crypto;
    constructor(prisma: PrismaService, passwordService: PasswordService, tokenService: TokenService, emailService: EmailService, audit: AuditService, mfa: MfaService, crypto: CryptoService);
    register(dto: RegisterDto): Promise<{
        userId: string;
        orgSlug: string;
        subDomain: string;
    }>;
    login(dto: LoginDto, resolvedOrg: Organisation | null, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | {
        requiresMfa: boolean;
        mfaToken: string;
    }>;
    private handleFailedLogin;
    issueSession(user: User & {
        org: Organisation;
    }, ip: string, userAgent: string, deviceId?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    mfaVerify(token: string, userId: string, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshToken: string, ip: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string, orgSlug: string): Promise<void>;
}
