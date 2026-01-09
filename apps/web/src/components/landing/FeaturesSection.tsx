"use client";

import { FileText, Shield, Users, BarChart3, Lock, Globe } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Contract Drafting",
    description:
      "Generate legally sound contracts in minutes with AI trained on African legal frameworks.",
  },
  {
    icon: Shield,
    title: "Compliance Automation",
    description:
      "Stay compliant with real-time monitoring and automatic regulatory updates.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Streamline workflows with centralized document management and real-time collaboration.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Get actionable insights with comprehensive analytics on contract performance.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption and SOC 2 compliance to protect sensitive data.",
  },
  {
    icon: Globe,
    title: "Multi-Jurisdiction",
    description:
      "Handle legal operations across multiple African countries seamlessly.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Built for African Legal Operations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage legal workflows, compliance, and
            governance at enterprise scale.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-5 rounded-lg border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
