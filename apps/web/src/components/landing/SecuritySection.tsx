"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  HiOutlineShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineServerStack,
  HiOutlineDocumentCheck,
  HiOutlineFingerPrint,
  HiOutlineCloudArrowUp
} from "react-icons/hi2";

const securityFeatures = [
  {
    icon: HiOutlineLockClosed,
    title: "256-bit Encryption",
    description: "All data encrypted at rest and in transit using AES-256 encryption standard.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "SOC 2 Type II",
    description: "Certified compliance with SOC 2 Type II security standards.",
  },
  {
    icon: HiOutlineServerStack,
    title: "Data Residency",
    description: "Choose where your data is stored to meet local compliance requirements.",
  },
  {
    icon: HiOutlineDocumentCheck,
    title: "GDPR Compliant",
    description: "Full compliance with GDPR and international data protection regulations.",
  },
  {
    icon: HiOutlineFingerPrint,
    title: "SSO & 2FA",
    description: "Enterprise-grade authentication with SSO and two-factor authentication.",
  },
  {
    icon: HiOutlineCloudArrowUp,
    title: "Regular Backups",
    description: "Automated backups with point-in-time recovery and disaster protection.",
  },
];

const trustBadges = ["SOC 2 Certified", "GDPR Ready", "ISO 27001"];

export function SecuritySection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 bg-muted/30 overflow-hidden" ref={sectionRef}>
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        {/* Animated shield and lock icons in background - only after mount */}
        {isMounted && (
          <>
            <motion.div
              className="absolute top-1/4 right-10 opacity-[0.03]"
              animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <HiOutlineShieldCheck className="w-32 h-32" />
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 left-10 opacity-[0.03]"
              animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <HiOutlineLockClosed className="w-24 h-24" />
            </motion.div>
          </>
        )}
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Enterprise Security
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your data,{" "}
              <span className="relative inline-block">
                protected
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "100%" } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                />
              </span>
              {" "}at every layer
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We understand that legal documents contain sensitive information. That&apos;s why security isn&apos;t just a feature—it&apos;s our foundation.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  {badge}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Security Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + 0.05 * index }}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
                >
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
