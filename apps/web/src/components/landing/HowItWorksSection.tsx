"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { 
  HiOutlineDocumentPlus, 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlinePaperAirplane,
  HiOutlineCheckCircle
} from "react-icons/hi2";
import Image from "next/image";

const steps = [
  {
    number: "01",
    icon: HiOutlineDocumentPlus,
    title: "Create or Import",
    description: "Start from scratch, use AI to draft, or import existing documents from your cloud storage.",
  },
  {
    number: "02",
    icon: HiOutlineSparkles,
    title: "AI Enhancement",
    description: "Our AI reviews your document, suggests improvements, and ensures legal accuracy.",
  },
  {
    number: "03",
    icon: HiOutlineShieldCheck,
    title: "Compliance Check",
    description: "Automated compliance analysis flags potential issues before they become problems.",
  },
  {
    number: "04",
    icon: HiOutlinePaperAirplane,
    title: "Sign & Share",
    description: "Send for e-signature, share with your team, and track everything in one place.",
  },
];

// Animated connecting line between steps


export function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 px-4 sm:px-6 bg-muted/30 border-y border-border">
      {/* Grid pattern background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        {/* Animated vertical lines - only after mount */}
       
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            How It Works
          </p>
          <h2 className="font-display text-2xl md:text-3xl lg:text-5xl font-bold mb-6">
            From draft to done in{" "}
            <span className="relative inline-block">
              four simple steps
              <motion.span
                className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              />
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Simplify your legal document workflow with an intuitive process designed for speed and accuracy.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative group"
              >
            
                <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300">
                  {/* Step number with animation */}
                  <motion.div 
                    className="text-5xl font-display font-bold text-muted-foreground/20 mb-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1, type: "spring" }}
                  >
                    {step.number}
                  </motion.div>
                  
                  {/* Icon */}
                  <motion.div 
                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Screenshot with hover animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xl">
            <div className="relative aspect-video w-full">
              <Image
                src="/hero-v2.png"
                alt="Largence Document Editor"
                fill
                className="object-cover object-top dark:hidden"
              />
              <Image
                src="/hero-dark-v2.png"
                alt="Largence Document Editor"
                fill
                className="object-cover object-top hidden dark:block"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
