import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MfaService {
    private crypto;
    private prisma;
    constructor(crypto: CryptoService, prisma: PrismaService);
    generateSecret(): string;
    generateQr(userEmail: string, secret: string): Promise<string>;
    verifyTotp(token: string, secret: string): boolean;
    generateBackupCodes(userId: string): Promise<string[]>;
    verifyBackupCode(userId: string, code: string): Promise<boolean>;
}
