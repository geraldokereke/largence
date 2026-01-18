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
    description: "Streamline document creation with AI-powered templates and smart drafting capabilities. Seamlessly export to industry-standard formats.",
    screenshot: "/hero.png",
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Real-Time Compliance Monitoring",
    description: "Proactive risk detection through automated compliance analysis. Stay ahead of regulatory requirements with instant alerts.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Unified Team Workspace",
    description: "Enterprise-grade collaboration with granular permissions and comprehensive audit trails. Empower your team to work efficiently.",
    screenshot: "/hero.png",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Enterprise Cloud Sync",
    description: "Seamless integration with leading cloud platforms. Maintain workflow continuity across your entire tech ecosystem.",
    screenshot: "/hero-dark.png",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Contextual Communication",
    description: "Matter-centric messaging that eliminates fragmented email threads. Keep conversations organized and accessible.",
    screenshot: "/hero.png",
  },
  {
    id: "signatures",
    icon: FileSignature,
    title: "Digital Signature Workflow",
    description: "Secure, legally-binding e-signatures with real-time tracking. Accelerate deal closures with integrated DocuSign support.",
    screenshot: "/hero-dark.png",
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % features.length;
        setActiveFeature(features[nextIndex]);
        return nextIndex;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6 h-screen" ref={sectionRef}>
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
          {/* Diagonal gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/20 to-transparent"></div>
        </div>
        
        {/* Text Content */}
        <div className="relative z-10">
          <div className="text-start mb-12 max-w-xs">
            <h1 className="text-4xl font-bold mb-4">
              Built for Modern <br></br> Legal Teams
            </h1>
             <p className="text-md text-gray-400">
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
                        height: isActive ? '80px' : '25px'
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className={`w-[3.5px] rounded-[0.5px] transition-colors duration-500 ${
                        isActive ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        
                        <h2 
                          className={`text-base transition-all duration-500 ${
                            isActive ? 'text-white font-semibold' : 'text-white/40 font-medium'
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
                        className={`text-sm text-white/50 overflow-hidden max-w-sm ${
                          isActive ? 'mt-2' : ''
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