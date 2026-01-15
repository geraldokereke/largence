import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "@largence/ui";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <PageHeader title="Terms of Service" date="31/01/2026" />
        <Card className="mt-6">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using the LARGENCE platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
            <h3>2. Use of the Platform</h3>
            <ul>
              <li>You must be at least 18 years old or have legal capacity to enter into contracts.</li>
              <li>You are responsible for your account and all activity under it.</li>
              <li>You must not use the platform for unlawful or prohibited purposes.</li>
            </ul>
            <h3>3. No Legal Advice</h3>
            <p>LARGENCE does not provide legal advice. All content, including AI-generated content, is for informational purposes only and should not be relied upon as legal advice.</p>
            <h3>4. Intellectual Property</h3>
            <ul>
              <li>All platform content is owned by LARGENCE or its licensors.</li>
              <li>You may not copy, modify, or distribute any content without permission.</li>
            </ul>
            <h3>5. Termination</h3>
            <p>We may suspend or terminate your access at any time for violation of these Terms or applicable law.</p>
            <h3>6. Disclaimers</h3>
            <ul>
              <li>The platform is provided “as is” without warranties of any kind.</li>
              <li>We do not guarantee accuracy, completeness, or fitness for a particular purpose.</li>
            </ul>
            <h3>7. Limitation of Liability</h3>
            <p>LARGENCE is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
            <h3>8. Changes to Terms</h3>
            <p>We may update these Terms at any time. Continued use of the platform constitutes acceptance of the new Terms.</p>
            <h3>9. Contact</h3>
            <p>Questions about these Terms can be sent to <a href="mailto:hello@largence.com">hello@largence.com</a>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
