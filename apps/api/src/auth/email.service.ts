import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail = process.env.EMAIL_FROM || 'Largence <no-reply@largence.com>';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_stub_123');
  }

  async sendVerificationEmail(email: string, token: string, orgSlug: string): Promise<void> {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/verify?token=${token}`;
    this.logger.log(`[DEV] Verification link: ${url}`);

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Verify your Largence account',
      html: `
        <h1>Welcome to Largence</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}">${url}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw new Error('EMAIL_DELIVERY_FAILED');
    }

    this.logger.log(`Verification email sent to ${email} (ID: ${data?.id})`);
  }

  async sendPasswordResetEmail(email: string, token: string, orgSlug: string): Promise<void> {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/reset-password?token=${token}`;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Reset your Largence password',
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${url}">${url}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw new Error('EMAIL_DELIVERY_FAILED');
    }

    this.logger.log(`Password reset email sent to ${email} (ID: ${data?.id})`);
  }

  async sendMfaSetupEmail(email: string, qrCodeUrl: string): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Secure your Largence account',
      html: `
        <h1>Multi-Factor Authentication</h1>
        <p>Scan the QR code below in your authenticator app to enable MFA:</p>
        <img src="${qrCodeUrl}" alt="QR Code" />
      `,
    });

    if (error) {
      this.logger.error(`Failed to send MFA setup email to ${email}`, error);
      throw new Error('EMAIL_DELIVERY_FAILED');
    }

    this.logger.log(`MFA setup email sent to ${email} (ID: ${data?.id})`);
  }

  async sendInviteEmail(
    email: string,
    token: string,
    orgName: string,
    orgSlug: string,
  ): Promise<void> {
    const url = `https://${orgSlug}.${process.env.BASE_DOMAIN}/accept-invite?token=${token}`;
    this.logger.log(`[DEV] Invite link: ${url}`);

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: `Invitation to join ${orgName} on Largence`,
      html: `
        <h1>You've been invited!</h1>
        <p>You've been invited to join <strong>${orgName}</strong> on Largence.</p>
        <p>Click the link below to accept the invitation and set up your account:</p>
        <a href="${url}">${url}</a>
        <p>This invitation will expire in 7 days.</p>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send invite email to ${email}`, error);
      throw new Error('EMAIL_DELIVERY_FAILED');
    }

    this.logger.log(`Invite email sent to ${email} (ID: ${data?.id})`);
  }
}
