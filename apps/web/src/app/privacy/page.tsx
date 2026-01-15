import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "@largence/ui";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <PageHeader title="Privacy Policy" date="31/01/2026" />
        <Card className="mt-6">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <h3>1. Introduction</h3>
            <p>This Privacy Policy explains how LARGENCE collects, uses, and protects your information.</p>
            <h3>2. Information We Collect</h3>
            <ul>
              <li>Account information (name, email, etc.)</li>
              <li>Usage data and analytics</li>
              <li>Documents and content you upload or create</li>
            </ul>
            <h3>3. How We Use Information</h3>
            <ul>
              <li>To provide and improve the platform</li>
              <li>To communicate with you</li>
              <li>To comply with legal obligations</li>
            </ul>
            <h3>4. Sharing of Information</h3>
            <ul>
              <li>We do not sell your personal information.</li>
              <li>We may share information with service providers and as required by law.</li>
            </ul>
            <h3>5. Data Security</h3>
            <p>We use reasonable measures to protect your information but cannot guarantee absolute security.</p>
            <h3>6. Your Rights</h3>
            <ul>
              <li>You may access, update, or delete your information by contacting us.</li>
              <li>You may opt out of marketing communications at any time.</li>
            </ul>
            <h3>7. Changes to This Policy</h3>
            <p>We may update this Privacy Policy. Continued use of the platform constitutes acceptance of the new policy.</p>
            <h3>8. Contact</h3>
            <p>Questions about privacy can be sent to <a href="mailto:hello@largence.com">hello@largence.com</a>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
