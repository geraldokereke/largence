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
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const preset_default_1 = require("@otplib/preset-default");
const QRCode = require("qrcode");
const crypto_service_1 = require("./crypto.service");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
let MfaService = class MfaService {
    constructor(crypto, prisma) {
        this.crypto = crypto;
        this.prisma = prisma;
    }
    generateSecret() {
        return preset_default_1.authenticator.generateSecret();
    }
    async generateQr(userEmail, secret) {
        const otpauth = preset_default_1.authenticator.keyuri(userEmail, 'Largence Legal OS', secret);
        return QRCode.toDataURL(otpauth);
    }
    verifyTotp(token, secret) {
        return preset_default_1.authenticator.verify({ token, secret });
    }
    async generateBackupCodes(userId) {
        const codes = [];
        const hashedCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
            codes.push(code);
            const codeHash = await bcrypt.hash(code, 10);
            hashedCodes.push({ userId, codeHash });
        }
        await this.prisma.mFABackupCode.deleteMany({ where: { userId } });
        await this.prisma.mFABackupCode.createMany({ data: hashedCodes });
        return codes;
    }
    async verifyBackupCode(userId, code) {
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
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [crypto_service_1.CryptoService,
        prisma_service_1.PrismaService])
], MfaService);
//# sourceMappingURL=mfa.service.js.map