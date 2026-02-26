"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@largence/ui";
import { CheckCircle2, FileText, BarChart3, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { ScheduleDemoDialog } from "../schedule-demo-dialog";

export function SolutionsSection() {
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);
  
  return (
    <section
      id="solutions"
      className="relative py-24 px-4 sm:px-6 bg-muted/30 touch-manipulation"
    >
      <motion.div
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 md:py-12 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Contract Management Section */}
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
              From drafting to execution and renewal, manage every stage of your
              contracts with intelligent automation and AI-powered insights.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                {
                  title: "AI-Powered Drafting",
                  desc: "Generate contracts 10x faster with contextual AI suggestions",
                },
                {
                  title: "Smart Templates",
                  desc: "Access 100+ pre-built templates for all markets",
                },
                {
                  title: "Automated Workflows",
                  desc: "Set up approval chains and reminders automatically",
                },
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
                    <h4 className="font-heading font-semibold mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <Button
              onClick={() => setDemoDialogOpen(true)}
              size="sm"
              variant="default"
              className="cursor-pointer group"
            >
              See it in action
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          {/* Right Side - Feature Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Contract Creation</h3>
                  <p className="text-sm text-muted-foreground">Simplified workflow</p>
                </div>
              </div>
              
              {/* Process Steps */}
              <div className="space-y-4">
                {[
                  { step: "1", title: "Select Template", desc: "Choose from 100+ templates" },
                  { step: "2", title: "AI Assistance", desc: "Get smart suggestions" },
                  { step: "3", title: "Review & Edit", desc: "Customize as needed" },
                  { step: "4", title: "Send for Signature", desc: "E-sign integration" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compliance Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Feature Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:order-1"
          >
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Compliance Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Real-time monitoring</p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">54</div>
                  <div className="text-xs text-muted-foreground">Countries Covered</div>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">98%</div>
                  <div className="text-xs text-muted-foreground">Compliance Rate</div>
                </div>
              </div>
              
              {/* Feature List */}
              <div className="space-y-3">
                {[
                  { icon: Zap, text: "Real-time alerts" },
                  { icon: Shield, text: "Risk assessment" },
                  { icon: Clock, text: "Audit trails" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
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
              Monitor compliance across global markets with
              regulatory updates and risk assessments.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                {
                  title: "Real-Time Monitoring",
                  desc: "Track regulatory changes across 54 different countries",
                },
                {
                  title: "Risk Assessment",
                  desc: "AI-powered analysis of contract risks and obligations",
                },
                {
                  title: "Complete Audit Trails",
                  desc: "Full documentation for compliance and legal reviews",
                },
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
                    <h4 className="font-heading font-semibold mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <Button
              onClick={() => setDemoDialogOpen(true)}
              size="sm"
              variant="default"
              className="cursor-pointer group"
            >
              Learn more
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <ScheduleDemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
    </section>
  );
}
