"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Scale,
  FileText,
  Shield,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@largence/ui";

const useCases = [
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate Legal Teams",
    description: "Streamline legal operations for enterprise organizations",
    features: [
      "Centralized contract repository",
      "Automated compliance tracking",
      "Multi-team collaboration",
      "Custom workflow automation",
    ],
  },
  {
    id: "law-firms",
    icon: Scale,
    title: "Law Firms",
    description: "Enhance client service with AI-powered tools",
    features: [
      "Client matter management",
      "Document automation",
      "Billing integration",
      "Secure client portals",
    ],
  },
  {
    id: "contract-management",
    icon: FileText,
    title: "Contract Management",
    description: "Complete lifecycle management for all contracts",
    features: [
      "AI-powered drafting",
      "Version control",
      "Renewal reminders",
      "Performance analytics",
    ],
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Teams",
    description: "Stay compliant across African jurisdictions",
    features: [
      "Real-time regulatory updates",
      "Automated audit trails",
      "Risk assessment tools",
      "Compliance dashboards",
    ],
  },
  {
    id: "procurement",
    icon: Briefcase,
    title: "Procurement",
    description: "Manage vendor contracts and agreements",
    features: [
      "Vendor contract library",
      "Approval workflows",
      "Spend analytics",
      "Risk monitoring",
    ],
  },
  {
    id: "hr-teams",
    icon: Users,
    title: "HR Teams",
    description: "Streamline employment documentation",
    features: [
      "Employment contract templates",
      "Policy management",
      "Onboarding workflows",
      "Compliance tracking",
    ],
  },
];

export function UseCasesSection() {
  const [selectedCase, setSelectedCase] = useState(useCases[0]);

  return (
    <section
      id="usecases"
      className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 bg-muted/30 touch-manipulation"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
            Use Cases
          </div>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Built for Every Legal Team
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            From corporate legal departments to law firms, Largence adapts to
            your unique needs.
          </p>
        </div>

        {/* Grid of Use Case Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            const isSelected = selectedCase.id === useCase.id;

            return (
              <motion.button
                key={useCase.id}
                onClick={() => setSelectedCase(useCase)}
                className={`group relative p-6 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-xl shadow-primary/20"
                    : "bg-card/50 border border-border/50 hover:border-primary/50 hover:shadow-lg backdrop-blur-sm"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedBorder"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 blur-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                <h3
                  className={`font-heading text-lg font-bold mb-2 transition-colors ${
                    isSelected
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {useCase.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Use Case Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background/50 to-primary/5 backdrop-blur-sm p-6 md:p-8"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left: Details */}
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Active Use Case</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                    {selectedCase.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {selectedCase.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wide">
                    Key Features
                  </h4>
                  <div className="grid gap-3">
                    {selectedCase.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Stats & CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative"
              >
                <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">50%</div>
                      <div className="text-xs text-muted-foreground">Time Saved</div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">90%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                      <div className="text-xs text-muted-foreground">Availability</div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">100+</div>
                      <div className="text-xs text-muted-foreground">Templates</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    <Button className="w-full group" size="sm">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      14-day free trial • No credit card required
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
