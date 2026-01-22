"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FileText, Shield, Users, Cloud, MessageSquare, FileSignature, ChevronRight } from "lucide-react";

const features = [
  {
    id: "documents",
    icon: FileText,
    title: "Intelligent Document Automation",
    description:
      "Create and manage documents faster with AI-powered templates and smart drafting. Export seamlessly to standard formats.",
    screenshot: "/hero.png",
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Real-Time Compliance Monitoring",
    description:
      "Automatically detect risks and stay compliant with continuous monitoring and instant regulatory alerts.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Unified Team Workspace",
    description:
      "Collaborate securely with role-based access, shared workspaces, and full activity audit trails.",
    screenshot: "/hero.png",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Enterprise Cloud Sync",
    description:
      "Sync effortlessly with leading cloud services to keep workflows connected and always up to date.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Contextual Communication",
    description:
      "Centralize discussions with matter-based messaging that replaces cluttered email threads.",
    screenshot: "/hero.png",
  },
  {
    id: "signatures",
    icon: FileSignature,
    title: "Digital Signature Workflow",
    description:
      "Send, track, and complete legally binding e-signatures faster with built-in DocuSign integration.",
    screenshot: "/hero-dark.png",
  },
];


export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const fullheight = 'h-full';
  // Auto-rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % features.length;
        setActiveFeature(features[nextIndex]);
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-16 md:py-0 px-4 sm:px-6 h-screen" ref={sectionRef}>
      {/* Content Layer */}
      <div className="relative max-w-6xl mx-auto h-full">
        {/* Background Image Layer - contained within max-w-6xl */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            key={activeFeature.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={activeFeature.screenshot}
              alt={activeFeature.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          {/* Diagonal linear overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-br from-background via-background/10 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/10 to-transparent"></div>

          {/* Edge blending overlays */}
          {/* Top edge fade */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-background to-transparent"></div>

          {/* Bottom edge fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent"></div>

          {/* Left edge fade */}
          <div className="absolute top-0 bottom-0 left-0 w-full bg-linear-to-r from-background via-transparent to-transparent"></div>

          {/* Right edge fade */}
          <div className="absolute top-0 bottom-0 right-0 w-40 bg-linear-to-l from-background via-transparent to-transparent"></div>
        </div>

        {/* Text Content */}
        <div className="relative z-10">
          <div className="text-start mb-12">
            <h1 className="text-4xl font-display font-medium mb-4">
              Built to Support Today's <br /> Legal Teams
            </h1>
            <p className="text-lg text-muted-foreground font-display max-w-xs">
              Intelligent tools that help your team work smarter and faster.
            </p>
          </div>

          <div className="flex flex-col gap-5 max-w-xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = currentIndex === index;

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isInView ? 1 : 0,
                    x: isInView ? 0 : -20
                  }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onClick={() => {
                    setCurrentIndex(index);
                    setActiveFeature(feature);
                  }}
                  className="cursor-pointer group"
                >
                  <div className="flex gap-3 items-stretch">
                    <motion.div
                      animate={{
                        height: isActive ? '70px' : '20px'
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className={`w-[3.5px] rounded-[0.5px] transition-colors duration-500 ${isActive ? 'bg-primary' : 'bg-muted'
                        }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2
                          className={`text-base font-display font-medium transition-all duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                          {feature.title}
                        </h2>
                      </div>
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: isActive ? 'auto' : 0,
                          opacity: isActive ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm text-muted-foreground font-display overflow-hidden max-w-sm ${isActive ? 'mt-2' : ''
                          }`}
                      >
                        {feature.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}