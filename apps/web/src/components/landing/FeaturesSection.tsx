"use client";

import { FileText, Shield, Users, Cloud, MessageSquare, FileSignature } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Document Creation",
    description:
      "Create legal documents from templates or use AI to help draft new ones. Export to DOCX when needed.",
  },
  {
    icon: Shield,
    title: "Compliance Checks",
    description:
      "Run automated compliance analysis on your documents. Get flagged for potential issues.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share documents with your team, set permissions, and track changes. Work together in one place.",
  },
  {
    icon: Cloud,
    title: "Cloud Integration",
    description:
      "Import from and sync to Dropbox, Google Drive, and Notion. Keep your files where you need them.",
  },
  {
    icon: MessageSquare,
    title: "Team Messaging",
    description:
      "Discuss documents and matters with your team in organized channels. No more email threads.",
  },
  {
    icon: FileSignature,
    title: "E-Signatures",
    description:
      "Send documents for signature via DocuSign integration. Track signing status in real-time.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            What You Get
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A straightforward platform for managing legal documents. No fluff, just the features you actually need.
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
