"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineBuildingOffice2,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { Button } from "@largence/ui";

const useCases = [
  {
    id: "corporate",
    icon: HiOutlineBuildingOffice2,
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
    icon: HiOutlineScale,
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
    icon: HiOutlineDocumentText,
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
    icon: HiOutlineShieldCheck,
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
    icon: HiOutlineBriefcase,
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
    icon: HiOutlineUserGroup,
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
      className="py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            Use Cases
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Built for Every Legal Team
          </h2>
          <p className="text-lg text-muted-foreground">
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
                className={`group relative p-6 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
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
            className="rounded-xl border border-border bg-card p-6 md:p-8"
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
                        <div className="shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5 text-primary" />
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
                <div className="rounded-xl border border-border bg-card p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <div className="text-3xl font-bold text-primary mb-1">50%</div>
                      <div className="text-xs text-muted-foreground">Time Saved</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <div className="text-3xl font-bold text-primary mb-1">90%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                      <div className="text-xs text-muted-foreground">Availability</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <div className="text-3xl font-bold text-primary mb-1">100+</div>
                      <div className="text-xs text-muted-foreground">Templates</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    <Button className="w-full group rounded-sm" size="sm">
                      Get Started
                      <HiOutlineArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
