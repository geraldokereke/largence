import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "@largence/ui";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <PageHeader title="Cookie Policy" date="31/01/2026" />
        <Card className="mt-6">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <h3>1. What Are Cookies?</h3>
            <p>Cookies are small text files stored on your device to help operate and analyze the platform.</p>
            <h3>2. How We Use Cookies</h3>
            <ul>
              <li>To remember your preferences and settings</li>
              <li>To analyze usage and improve the platform</li>
              <li>To enable essential platform features</li>
            </ul>
            <h3>3. Managing Cookies</h3>
            <ul>
              <li>You can control cookies through your browser settings</li>
              <li>Disabling cookies may affect platform functionality</li>
            </ul>
            <h3>4. Changes to This Policy</h3>
            <p>We may update this Cookie Policy. Continued use of the platform constitutes acceptance of the new policy.</p>
            <h3>5. Contact</h3>
            <p>Questions about cookies can be sent to <a href="mailto:hello@largence.com">hello@largence.com</a>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
