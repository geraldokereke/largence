"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FileText, Shield, Users, Cloud, MessageSquare, FileSignature, ChevronRight } from "lucide-react";

const features = [
  {
    id: "documents",
    icon: FileText,
    title: "Document Creation",
    description: "Create legal documents from templates or use AI to help draft new ones. Export to DOCX when needed.",
    screenshot: "/hero.png",
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Checks",
    description: "Run automated compliance analysis on your documents. Get flagged for potential issues.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Team Collaboration",
    description: "Share documents with your team, set permissions, and track changes. Work together in one place.",
    screenshot: "/hero.png",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Integration",
    description: "Import from and sync to Dropbox, Google Drive, and Notion. Keep your files where you need them.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Team Messaging",
    description: "Discuss documents and matters with your team in organized channels. No more email threads.",
    screenshot: "/hero.png",
  },
  {
    id: "signatures",
    icon: FileSignature,
    title: "E-Signatures",
    description: "Send documents for signature via DocuSign integration. Track signing status in real-time.",
    screenshot: "/hero-dark.png",
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6 bg-muted/30" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practical tools for legal document management. No fluff, just what works.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature.id === feature.id;
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                  onClick={() => setActiveFeature(feature)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "bg-card border-primary shadow-md"
                      : "bg-background border-transparent hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 shrink-0 transition-all ${
                      isActive ? "text-primary" : "text-muted-foreground opacity-0"
                    }`} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Feature Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-24"
          >
            <div className="rounded-lg border bg-card overflow-hidden shadow-xl">
              <div className="relative aspect-[16/10] w-full bg-muted">
                <Image
                  src={activeFeature.screenshot}
                  alt={activeFeature.title}
                  fill
                  className="object-cover transition-opacity duration-300"
                  key={activeFeature.id}
                />
              </div>
              <div className="p-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = activeFeature.icon;
                    return <Icon className="w-4 h-4 text-primary" />;
                  })()}
                  <h4 className="font-semibold text-sm">{activeFeature.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeFeature.description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
