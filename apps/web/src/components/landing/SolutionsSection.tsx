"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@largence/ui";
import { CheckCircle2, FileText, BarChart3 } from "lucide-react";
import { ScheduleDemoDialog } from "../schedule-demo-dialog";

export function SolutionsSection() {
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);
  return (
    <section id="solutions" className="relative py-24 px-4 sm:px-6 bg-muted/30 touch-manipulation">
      <motion.div 
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 md:py-12 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-12 md:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
              Contract Management
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Streamline Your Entire Contract Lifecycle
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              From drafting to execution and renewal, manage every stage of your contracts with intelligent automation and AI-powered insights.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { title: "AI-Powered Drafting", desc: "Generate contracts 10x faster with contextual AI suggestions" },
                { title: "Smart Templates", desc: "Access 100+ pre-built templates for African markets" },
                { title: "Automated Workflows", desc: "Set up approval chains and reminders automatically" }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <Button
              onClick={() => setDemoDialogOpen(true)}
              size="sm"
              variant="default"
              className="cursor-pointer"
            >
              See it in action
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-xl">
              <div className="aspect-4/3 bg-muted/50 rounded-lg overflow-hidden relative flex items-center justify-center">
                <FileText className="w-24 h-24 text-primary/20" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:order-1"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-xl">
              <div className="aspect-4/3 bg-muted/50 rounded-lg overflow-hidden relative flex items-center justify-center">
                <BarChart3 className="w-24 h-24 text-primary/20" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:order-2"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Compliance & Governance
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
              Stay Ahead of Regulatory Changes
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-8 leading-relaxed">
              Monitor compliance across all African markets with real-time regulatory updates and automated risk assessments.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { title: "Real-Time Monitoring", desc: "Track regulatory changes across 54 African countries" },
                { title: "Risk Assessment", desc: "AI-powered analysis of contract risks and obligations" },
                { title: "Complete Audit Trails", desc: "Full documentation for compliance and legal reviews" }
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <Button
              onClick={() => setDemoDialogOpen(true)}
              size="sm"
              variant="default"
              className="cursor-pointer"
            >
              Learn more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <ScheduleDemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
    </section>
  );
}
