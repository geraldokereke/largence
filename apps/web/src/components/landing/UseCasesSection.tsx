"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Scale, FileText, Shield, Briefcase, Users } from "lucide-react";
import Image from "next/image";

const useCases = [
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate Legal Teams",
    description: "Streamline legal operations for enterprise organizations",
    screenshot: "/screenshot.png",
    features: [
      "Centralized contract repository",
      "Automated compliance tracking",
      "Multi-team collaboration",
      "Custom workflow automation"
    ]
  },
  {
    id: "law-firms",
    icon: Scale,
    title: "Law Firms",
    description: "Enhance client service with AI-powered tools",
    screenshot: "/screenshot.png",
    features: [
      "Client matter management",
      "Document automation",
      "Billing integration",
      "Secure client portals"
    ]
  },
  {
    id: "contract-management",
    icon: FileText,
    title: "Contract Management",
    description: "Complete lifecycle management for all contracts",
    screenshot: "/screenshot.png",
    features: [
      "AI-powered drafting",
      "Version control",
      "Renewal reminders",
      "Performance analytics"
    ]
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Teams",
    description: "Stay compliant across African jurisdictions",
    screenshot: "/screenshot.png",
    features: [
      "Real-time regulatory updates",
      "Automated audit trails",
      "Risk assessment tools",
      "Compliance dashboards"
    ]
  },
  {
    id: "procurement",
    icon: Briefcase,
    title: "Procurement",
    description: "Manage vendor contracts and agreements",
    screenshot: "/screenshot.png",
    features: [
      "Vendor contract library",
      "Approval workflows",
      "Spend analytics",
      "Risk monitoring"
    ]
  },
  {
    id: "hr-teams",
    icon: Users,
    title: "HR Teams",
    description: "Streamline employment documentation",
    screenshot: "/screenshot.png",
    features: [
      "Employment contract templates",
      "Policy management",
      "Onboarding workflows",
      "Compliance tracking"
    ]
  }
];

export function UseCasesSection() {
  const [selectedCase, setSelectedCase] = useState(useCases[0]);

  return (
    <section id="usecases" className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 bg-muted/30 touch-manipulation">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
            Use Cases
          </div>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Built for Every Legal Team
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            From corporate legal departments to law firms, Largence adapts to your unique needs.
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
                    ? 'bg-primary/10 border-2 border-primary shadow-xl shadow-primary/20'
                    : 'bg-card/50 border border-border/50 hover:border-primary/50 hover:shadow-lg backdrop-blur-sm'
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
                    className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 blur-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : 'bg-linear-to-br from-muted to-muted/50 text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className={`font-heading text-lg font-bold mb-2 transition-colors ${
                  isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}>
                  {useCase.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-background/50 to-primary/5 backdrop-blur-sm p-6 md:p-8"
          >
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
              {/* Left: Details */}
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Active Use Case</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">{selectedCase.title}</h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{selectedCase.description}</p>
                </div>
                
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wide">Key Features</h4>
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
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Screenshot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-linear-to-br from-primary/30 via-primary/20 to-primary/30 rounded-3xl blur-2xl opacity-60" />
                <div className="relative rounded-xl border border-primary/30 bg-linear-to-b from-background/90 to-background/60 backdrop-blur-md p-2 overflow-hidden">
                  {/* Window Controls */}
                  <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 bg-muted/40 rounded-t-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  
                  {/* Screenshot */}
                  <div className="relative aspect-4/3 bg-linear-to-br from-muted/40 to-muted/20 rounded-lg overflow-hidden border border-border/30">
                    <Image
                      src={selectedCase.screenshot}
                      alt={selectedCase.title}
                      fill
                      className="object-cover object-top"
                    />
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
