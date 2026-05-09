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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const client_ses_1 = require("@aws-sdk/client-ses");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.ses = new client_ses_1.SESClient({
            region: process.env.AWS_REGION || 'eu-west-2',
        });
    }
    async sendEmail(to, subject, html) {
        const from = process.env.AWS_SES_FROM_ADDRESS || 'noreply@largence.com';
        const command = new client_ses_1.SendEmailCommand({
            Destination: { ToAddresses: [to] },
            Message: {
                Body: { Html: { Data: html, Charset: 'UTF-8' } },
                Subject: { Data: subject, Charset: 'UTF-8' },
            },
            Source: from,
        });
        try {
            await this.ses.send(command);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
            if (process.env.NODE_ENV !== 'production') {
                this.logger.debug(`Email Subject: ${subject}`);
                this.logger.debug(`Email HTML: ${html}`);
            }
        }
    }
    async sendVerificationEmail(to, token, orgSlug) {
        const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/verify?token=${token}`;
        const html = `<h1>Verify your email</h1><p>Please click <a href="${url}">here</a> to verify your email.</p>`;
        await this.sendEmail(to, 'Verify your email - Largence', html);
    }
    async sendPasswordResetEmail(to, token, orgSlug) {
        const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/reset-password?token=${token}`;
        const html = `<h1>Reset your password</h1><p>Please click <a href="${url}">here</a> to reset your password.</p>`;
        await this.sendEmail(to, 'Reset your password - Largence', html);
    }
    async sendInviteEmail(to, token, orgSlug, invitedBy) {
        const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/register/invite?token=${token}`;
        const html = `<h1>You've been invited</h1><p>${invitedBy} has invited you to join their organisation on Largence. Click <a href="${url}">here</a> to accept.</p>`;
        await this.sendEmail(to, 'You are invited to join Largence', html);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map