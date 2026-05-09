import { Injectable } from '@nestjs/common';
import { authenticator } from '@otplib/preset-default';
import * as QRCode from 'qrcode';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MfaService {
  constructor(
    private crypto: CryptoService,
    private prisma: PrismaService,
  ) {}

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  async generateQr(userEmail: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(userEmail, 'Largence Legal OS', secret);
    return QRCode.toDataURL(otpauth);
  }

  verifyTotp(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    const hashedCodes = [];

    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase(); // 8 chars
      codes.push(code);
      const codeHash = await bcrypt.hash(code, 10);
      hashedCodes.push({ userId, codeHash });
    }

    // Clear old codes and insert new ones
    await this.prisma.mFABackupCode.deleteMany({ where: { userId } });
    await this.prisma.mFABackupCode.createMany({ data: hashedCodes });

    return codes;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const userCodes = await this.prisma.mFABackupCode.findMany({
      where: { userId, usedAt: null },
    });

    for (const backupCode of userCodes) {
      const isMatch = await bcrypt.compare(code, backupCode.codeHash);
      if (isMatch) {
        await this.prisma.mFABackupCode.update({
          where: { id: backupCode.id },
          data: { usedAt: new Date() },
        });
        return true;
      }
    }

    return false;
  }
}
