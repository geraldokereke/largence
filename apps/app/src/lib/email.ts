import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Largence <notifications@largence.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com";
const LOGO_URL = "https://yzub7xjzmf.ufs.sh/f/p5WCAJ95HVcjgYC432GEBSMyKGoQHCer52qVZUbLRczuTNkm";
const PRIMARY_COLOR = "#0d9488";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

// Email Template Generator
function emailWrapper(content: string, previewText?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Largence</title>
  ${previewText ? `<meta name="x-apple-disable-message-reformatting"><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${previewText}</span>` : ""}
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <img src="${LOGO_URL}" alt="Largence" height="40" style="display: block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #71717a;">
                      Largence - Legal Document Management Made Simple
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                      © ${new Date().getFullYear()} Largence. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Button component for emails
function emailButton(text: string, url: string, color: string = PRIMARY_COLOR) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${color}; border-radius: 6px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ===============================
// Email Templates
// ===============================

export const emailTemplates = {
  // Welcome email for new users
  welcome: (params: { name: string; email: string }) => ({
    subject: "Welcome to Largence! 🎉",
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        Welcome to Largence, ${params.name}!
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        We're thrilled to have you on board. Largence is your all-in-one platform for creating, managing, and collaborating on legal documents.
      </p>
      <p style="margin: 0 0 8px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Here's what you can do:
      </p>
      <ul style="margin: 0 0 16px; padding-left: 24px; font-size: 14px; line-height: 24px; color: #52525b;">
        <li>Create professional legal documents from templates</li>
        <li>Use AI to generate and improve your documents</li>
        <li>Run compliance checks to ensure legal accuracy</li>
        <li>Collaborate with your team in real-time</li>
        <li>Get documents signed with DocuSign integration</li>
      </ul>
      ${emailButton("Get Started", `${APP_URL}/documents`)}
      <p style="margin: 0; font-size: 14px; color: #71717a;">
        Need help? Reply to this email or visit our <a href="${APP_URL}/help" style="color: #18181b;">Help Center</a>.
      </p>
    `, "Welcome to Largence - Your legal documents, simplified"),
  }),

  // Team invitation email
  teamInvite: (params: { 
    inviterName: string; 
    organizationName: string; 
    inviteUrl: string;
    role: string;
  }) => ({
    subject: `${params.inviterName} invited you to join ${params.organizationName} on Largence`,
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        You're invited to join ${params.organizationName}
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        ${params.inviterName} has invited you to collaborate on Largence as a <strong>${params.role}</strong>.
      </p>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #52525b;">
        Largence is a legal document management platform that helps teams create, manage, and collaborate on legal documents with AI-powered assistance.
      </p>
      ${emailButton("Accept Invitation", params.inviteUrl, "#2563eb")}
      <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
        This invitation link will expire in 7 days.
      </p>
    `, `${params.inviterName} invited you to collaborate on Largence`),
  }),

  // Document shared notification
  documentShared: (params: {
    sharedBy: string;
    documentTitle: string;
    documentUrl: string;
    permission: string;
  }) => ({
    subject: `${params.sharedBy} shared "${params.documentTitle}" with you`,
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        Document Shared With You
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        <strong>${params.sharedBy}</strong> has shared a document with you.
      </p>
      <div style="padding: 16px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e4e4e7; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Document</p>
        <p style="margin: 0; font-size: 16px; font-weight: 500; color: #18181b;">${params.documentTitle}</p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #52525b;">
          You have <strong>${params.permission}</strong> access
        </p>
      </div>
      ${emailButton("View Document", params.documentUrl)}
    `, `${params.sharedBy} shared "${params.documentTitle}" with you on Largence`),
  }),

  // Compliance check completed
  complianceComplete: (params: {
    documentTitle: string;
    score: number;
    issuesCount: number;
    documentUrl: string;
  }) => ({
    subject: `Compliance Check Complete: ${params.documentTitle} (${params.score}%)`,
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        Compliance Check Complete
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        The compliance check for <strong>${params.documentTitle}</strong> has completed.
      </p>
      <div style="padding: 16px; background-color: ${params.score >= 80 ? '#f0fdf4' : params.score >= 60 ? '#fefce8' : '#fef2f2'}; border-radius: 8px; border: 1px solid ${params.score >= 80 ? '#bbf7d0' : params.score >= 60 ? '#fef08a' : '#fecaca'}; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 14px; color: #71717a;">Compliance Score</p>
        <p style="margin: 0; font-size: 36px; font-weight: 700; color: ${params.score >= 80 ? '#16a34a' : params.score >= 60 ? '#ca8a04' : '#dc2626'};">${params.score}%</p>
        ${params.issuesCount > 0 ? `<p style="margin: 8px 0 0; font-size: 14px; color: #52525b;">${params.issuesCount} issue${params.issuesCount > 1 ? 's' : ''} found</p>` : ''}
      </div>
      ${emailButton("View Details", params.documentUrl)}
    `, `Compliance check complete: ${params.score}% score for ${params.documentTitle}`),
  }),

  // Signature request
  signatureRequest: (params: {
    senderName: string;
    documentTitle: string;
    signingUrl: string;
    expiresAt?: string;
  }) => {
    const docTitle = params.documentTitle;
    const sender = params.senderName || "A team member";
    return {
      subject: `${sender} requested your signature on "${docTitle}"`,
      html: emailWrapper(`
        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
          Signature Requested
        </h1>
        <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
          <strong>${sender}</strong> has requested your signature on a document.
        </p>
        <div style="padding: 16px; background-color: #f0fdfa; border-radius: 8px; border: 1px solid #99f6e4; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Document</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #18181b;">${docTitle}</p>
          ${params.expiresAt ? `<p style="margin: 8px 0 0; font-size: 12px; color: #71717a;">Expires: ${params.expiresAt}</p>` : ''}
        </div>
        ${emailButton("Sign Document", params.signingUrl)}
        <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
          If you weren't expecting this request, please ignore this email.
        </p>
      `, `${sender} needs your signature on "${docTitle}"`),
    };
  },

  // Weekly digest
  weeklyDigest: (params: {
    name: string;
    stats: {
      documentsCreated: number;
      documentsEdited: number;
      complianceChecks: number;
      averageScore: number;
    };
    recentDocuments: { title: string; url: string }[];
  }) => ({
    subject: "Your Weekly Largence Digest",
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        Your Weekly Summary, ${params.name}
      </h1>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        Here's what happened on Largence this week:
      </p>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
        <tr>
          <td width="50%" style="padding: 12px; background-color: #fafafa; border-radius: 8px 0 0 8px; border: 1px solid #e4e4e7; border-right: none; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">${params.stats.documentsCreated}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">Documents Created</p>
          </td>
          <td width="50%" style="padding: 12px; background-color: #fafafa; border-radius: 0 8px 8px 0; border: 1px solid #e4e4e7; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">${params.stats.documentsEdited}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">Documents Edited</p>
          </td>
        </tr>
      </table>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
        <tr>
          <td width="50%" style="padding: 12px; background-color: #fafafa; border-radius: 8px 0 0 8px; border: 1px solid #e4e4e7; border-right: none; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">${params.stats.complianceChecks}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">Compliance Checks</p>
          </td>
          <td width="50%" style="padding: 12px; background-color: #fafafa; border-radius: 0 8px 8px 0; border: 1px solid #e4e4e7; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${params.stats.averageScore >= 80 ? '#16a34a' : '#ca8a04'};">${params.stats.averageScore}%</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">Avg. Compliance Score</p>
          </td>
        </tr>
      </table>

      ${params.recentDocuments.length > 0 ? `
        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #18181b;">Recent Documents</p>
        <ul style="margin: 0 0 24px; padding-left: 0; list-style: none;">
          ${params.recentDocuments.map(doc => `
            <li style="margin-bottom: 8px;">
              <a href="${doc.url}" style="font-size: 14px; color: #2563eb; text-decoration: none;">${doc.title}</a>
            </li>
          `).join('')}
        </ul>
      ` : ''}
      
      ${emailButton("View Dashboard", `${APP_URL}/analytics`)}
    `, "Your weekly activity summary on Largence"),
  }),

  // Document status change
  documentStatusChange: (params: {
    documentTitle: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    documentUrl: string;
  }) => ({
    subject: `Document status changed: ${params.documentTitle}`,
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        Document Status Updated
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        <strong>${params.changedBy}</strong> changed the status of <strong>${params.documentTitle}</strong>.
      </p>
      <div style="padding: 16px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e4e4e7; margin-bottom: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="45%" style="text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #71717a;">From</p>
              <p style="margin: 0; font-size: 14px; font-weight: 500; color: #52525b; text-transform: capitalize;">${params.oldStatus}</p>
            </td>
            <td width="10%" style="text-align: center;">
              <p style="margin: 0; font-size: 18px; color: #a1a1aa;">→</p>
            </td>
            <td width="45%" style="text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #71717a;">To</p>
              <p style="margin: 0; font-size: 14px; font-weight: 500; color: #18181b; text-transform: capitalize;">${params.newStatus}</p>
            </td>
          </tr>
        </table>
      </div>
      ${emailButton("View Document", params.documentUrl)}
    `, `Status changed from ${params.oldStatus} to ${params.newStatus}`),
  }),

  // Comment notification
  documentComment: (params: {
    commenterName: string;
    documentTitle: string;
    commentPreview: string;
    documentUrl: string;
  }) => ({
    subject: `${params.commenterName} commented on "${params.documentTitle}"`,
    html: emailWrapper(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
        New Comment
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
        <strong>${params.commenterName}</strong> commented on <strong>${params.documentTitle}</strong>:
      </p>
      <div style="padding: 16px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid #18181b; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #3f3f46; font-style: italic;">
          "${params.commentPreview}"
        </p>
      </div>
      ${emailButton("View & Reply", params.documentUrl)}
    `, `New comment from ${params.commenterName}`),
  }),
};

// Helper to send templated emails
export async function sendTemplatedEmail<T extends keyof typeof emailTemplates>(
  template: T,
  to: string | string[],
  params: Parameters<(typeof emailTemplates)[T]>[0]
) {
  const templateFn = emailTemplates[template];
  const { subject, html } = templateFn(params as never);
  
  return sendEmail({
    to,
    subject,
    html,
  });
}
