import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "@largence/ui";

export default function AupPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <PageHeader title="Acceptable Use Policy" date="31/01/2026" />
        <Card className="mt-6">
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <h3>1. Prohibited Activities</h3>
            <ul>
              <li>No unlawful, harmful, or fraudulent activity</li>
              <li>No harassment, abuse, or threats</li>
              <li>No infringement of intellectual property</li>
              <li>No attempts to bypass security or misuse the platform</li>
            </ul>
            <h3>2. User Responsibilities</h3>
            <ul>
              <li>Keep your account secure</li>
              <li>Report suspected abuse or security issues</li>
              <li>Comply with all applicable laws</li>
            </ul>
            <h3>3. Enforcement</h3>
            <ul>
              <li>Violations may result in suspension or termination</li>
              <li>We may investigate and take appropriate action</li>
            </ul>
            <h3>4. Contact</h3>
            <p>Questions about this policy can be sent to <a href="mailto:hello@largence.com">hello@largence.com</a>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
