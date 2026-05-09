export declare class EmailService {
    private ses;
    private readonly logger;
    constructor();
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    sendVerificationEmail(to: string, token: string, orgSlug: string): Promise<void>;
    sendPasswordResetEmail(to: string, token: string, orgSlug: string): Promise<void>;
    sendInviteEmail(to: string, token: string, orgSlug: string, invitedBy: string): Promise<void>;
}
