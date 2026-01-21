"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FileText, Wand2, CheckCircle, Send, ArrowRight } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Create or Import",
    description: "Start from scratch, use AI to draft, or import existing documents from your cloud storage.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Enhancement",
    description: "Our AI reviews your document, suggests improvements, and ensures legal accuracy.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Compliance Check",
    description: "Automated compliance analysis flags potential issues before they become problems.",
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "04",
    icon: Send,
    title: "Sign & Share",
    description: "Send for e-signature, share with your team, and track everything in one place.",
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            Simple Process
          </motion.div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            How <span className="text-primary">Largence</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From document creation to signature, our streamlined workflow gets your legal work done faster.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative p-6 rounded-2xl border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  {/* Step number */}
                  <div className={`absolute -top-4 -right-2 text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center z-10">
                    <div className="w-8 h-8 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
        >
          <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-card to-background overflow-hidden">
            <motion.div style={{ y }} className="absolute inset-0 bg-grid-pattern opacity-5" />
            
            <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  See It In Action
                </h3>
                <p className="text-muted-foreground mb-6">
                  Watch how legal teams are using Largence to cut document creation time by 70% and ensure compliance across multiple jurisdictions.
                </p>
                <ul className="space-y-3 mb-6">
                  {["AI-powered drafting", "Real-time collaboration", "Automated compliance", "E-signature integration"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted">
                <Image
                  src="/hero-v2.png"
                  alt="Largence in action"
                  fill
                  className="object-cover dark:hidden"
                />
                <Image
                  src="/hero-dark-v2.png"
                  alt="Largence in action"
                  fill
                  className="object-cover hidden dark:block"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group/play">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
