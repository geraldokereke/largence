import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private ses: SESClient;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.ses = new SESClient({
      region: process.env.AWS_REGION || 'eu-west-2',
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const from = process.env.AWS_SES_FROM_ADDRESS || 'noreply@largence.com';
    const command = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
        Subject: { Data: subject, Charset: 'UTF-8' },
      },
      Source: from,
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      // In dev, we might want to log the email content
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Email Subject: ${subject}`);
        this.logger.debug(`Email HTML: ${html}`);
      }
    }
  }

  async sendVerificationEmail(to: string, token: string, orgSlug: string) {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/verify?token=${token}`;
    const html = `<h1>Verify your email</h1><p>Please click <a href="${url}">here</a> to verify your email.</p>`;
    await this.sendEmail(to, 'Verify your email - Largence', html);
  }

  async sendPasswordResetEmail(to: string, token: string, orgSlug: string) {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/reset-password?token=${token}`;
    const html = `<h1>Reset your password</h1><p>Please click <a href="${url}">here</a> to reset your password.</p>`;
    await this.sendEmail(to, 'Reset your password - Largence', html);
  }

  async sendInviteEmail(to: string, token: string, orgSlug: string, invitedBy: string) {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/auth/register/invite?token=${token}`;
    const html = `<h1>You've been invited</h1><p>${invitedBy} has invited you to join their organisation on Largence. Click <a href="${url}">here</a> to accept.</p>`;
    await this.sendEmail(to, 'You are invited to join Largence', html);
  }
}
