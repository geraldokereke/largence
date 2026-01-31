"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  HiOutlineDocumentText, 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineUserGroup, 
  HiOutlineScale, 
  HiOutlinePencilSquare,
  HiChevronRight
} from "react-icons/hi2";

// Features data
const features = [
  {
    id: "documents",
    icon: HiOutlineDocumentText,
    title: "Document Creation",
    description: "Create legal documents from templates or use AI to help draft new ones. Export to DOCX when needed.",
    screenshot: "/hero-v2.png",
  },
  {
    id: "ai-assistant",
    icon: HiOutlineSparkles,
    title: "AI Assistant",
    description: "Get intelligent suggestions, draft clauses, and improve your documents with AI-powered assistance.",
    screenshot: "/hero-dark-v2.png",
  },
  {
    id: "compliance",
    icon: HiOutlineShieldCheck,
    title: "Compliance Checks",
    description: "Run automated compliance analysis on your documents. Get flagged for potential issues.",
    screenshot: "/hero-v2.png",
  },
  {
    id: "collaboration",
    icon: HiOutlineUserGroup,
    title: "Team Collaboration",
    description: "Share documents with your team, set permissions, and track changes. Work together in one place.",
    screenshot: "/hero-dark-v2.png",
  },
  {
    id: "matters",
    icon: HiOutlineScale,
    title: "Matter Management",
    description: "Organize your legal matters, track deadlines, and keep all related documents in one place.",
    screenshot: "/hero-v2.png",
  },
  {
    id: "signatures",
    icon: HiOutlinePencilSquare,
    title: "E-Signatures",
    description: "Send documents for signature via DocuSign integration. Track signing status in real-time.",
    screenshot: "/hero-dark-v2.png",
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [isMounted, setIsMounted] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section id="features" className="relative py-20 md:py-28 px-4 sm:px-6" ref={sectionRef}>
      {/* Grid background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        {/* Animated horizontal lines - only after mount */}
        {isMounted && (
          <>
            <motion.div
              className="absolute top-1/4 left-0 w-24 h-px bg-primary/40"
              animate={{ x: ["0%", "300%", "0%"] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-2/3 right-0 w-32 h-px bg-primary/30"
              animate={{ x: ["0%", "-200%", "0%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            Features
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            <span className="relative inline-block">
              Everything
              <motion.span
                className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </span>{" "}
            You Need
          </h2>
          <p className="text-lg text-muted-foreground">
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
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "bg-card border-primary shadow-md"
                      : "bg-background border-transparent hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                      animate={isActive ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <motion.div
                      animate={isActive ? { x: [0, 3, 0] } : {}}
                      transition={{ duration: 0.4, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                    >
                      <HiChevronRight className={`w-5 h-5 shrink-0 transition-all ${
                        isActive ? "text-primary" : "text-muted-foreground opacity-0"
                      }`} />
                    </motion.div>
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
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="relative aspect-16/10 w-full bg-muted overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeFeature.screenshot}
                      alt={activeFeature.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="p-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    key={activeFeature.id + "-icon"}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {(() => {
                      const Icon = activeFeature.icon;
                      return <Icon className="w-4 h-4 text-primary" />;
                    })()}
                  </motion.div>
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
