"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, Users, BarChart3, Lock, Globe } from "lucide-react";
import Image from "next/image";

const features = [
  {
    id: "contracts",
    icon: FileText,
    title: "AI Contract Drafting",
    description:
      "Generate legally sound contracts in minutes with AI trained on African legal frameworks.",
    details: {
      heading: "Transform Contract Creation",
      subheading: "AI-powered drafting that understands African legal systems",
      points: [
        "54 African jurisdictions covered",
        "Custom templates for your industry",
        "Smart clause library with best practices",
        "Version control and collaboration tools",
      ],
    },
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Automation",
    description:
      "Stay compliant with real-time monitoring and automatic regulatory updates.",
    details: {
      heading: "Automate Compliance Management",
      subheading: "Real-time monitoring across all African markets",
      points: [
        "Real-time regulatory alerts",
        "Complete audit trails",
        "Automated regulatory tracking",
        "Risk assessment dashboards",
      ],
    },
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Team Collaboration",
    description:
      "Streamline workflows with centralized document management and real-time collaboration.",
    details: {
      heading: "Work Together Seamlessly",
      subheading: "Centralized platform for your entire legal team",
      points: [
        "Version control and history",
        "Role-based access control",
        "Activity feeds and notifications",
        "Commenting and review tools",
      ],
    },
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Get actionable insights with comprehensive analytics on contract performance.",
    details: {
      heading: "Data-Driven Legal Operations",
      subheading: "Turn legal data into strategic insights",
      points: [
        "Custom dashboards and reports",
        "Risk assessment scoring",
        "Performance metrics tracking",
        "Export to Excel, PDF, and more",
      ],
    },
  },
  {
    id: "security",
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption and SOC 2 compliance to protect sensitive data.",
    details: {
      heading: "Security You Can Trust",
      subheading: "Enterprise-grade protection for your legal documents",
      points: [
        "256-bit AES encryption",
        "SOC 2 Type II certified",
        "GDPR compliant",
        "Regular security audits",
      ],
    },
  },
  {
    id: "jurisdiction",
    icon: Globe,
    title: "Multi-Jurisdiction",
    description:
      "Handle legal operations across multiple African countries seamlessly.",
    details: {
      heading: "Pan-African Legal Coverage",
      subheading: "One platform for all your African markets",
      points: [
        "54 African jurisdictions",
        "Local legal requirements",
        "Multi-language support",
        "Region-specific templates",
      ],
    },
  },
];

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <section
      id="features"
      className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 touch-manipulation"
    >
      <motion.div
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 rounded-xl border border-border/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
            Platform Features
          </div>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Built for African Legal Operations
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage legal workflows, compliance, and
            governance at enterprise scale.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6 md:gap-8">
          {/* Left: Feature Cards (Vertical) */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature.id === feature.id;

              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={`w-full group relative p-4 rounded-xl text-left transition-all cursor-pointer touch-manipulation ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-heading font-semibold mb-1 text-sm ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Screenshot and Details */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeature.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Screenshot */}
                <div className="relative rounded-xl border border-border/50 bg-linear-to-b from-background/80 to-background/40 backdrop-blur-xl p-3 overflow-hidden">
                  <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-3xl opacity-50" />

                  {/* Screenshot */}
                  <div className="relative aspect-video bg-linear-to-br from-muted/50 to-muted/30 rounded-xl overflow-hidden border border-border/30">
                    <Image
                      src="/demo.gif"
                      alt={selectedFeature.title}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="font-heading text-xl font-semibold">
                    {selectedFeature.details.heading}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedFeature.details.subheading}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {selectedFeature.details.points.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
