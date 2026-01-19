"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCloud, FaComments, FaFileSignature, FaUsers } from "react-icons/fa6";
import { FaFileAlt, FaShieldAlt } from "react-icons/fa";
import { Button } from "@largence/ui";
import AnimatedBadge from "./landing/Badge";
import Image from "next/image";


const tabs = [
  { 
    id: "documents", 
    label: "Document Creation",
    icon: FaFileAlt,
    lightImage: "/hero.png",
    darkImage: "/hero-dark-2.png"
  },
  { 
    id: "compliance", 
    label: "Compliance Checks",
    icon: FaShieldAlt,
    lightImage: "/hero-contracts.png",
    darkImage: "/hero-contracts-dark.png"
  },
  { 
    id: "collaboration", 
    label: "Team Collaboration",
    icon: FaUsers, 
    lightImage: "/hero-compliance.png",
    darkImage: "/hero-compliance-dark.png"
  },
  { 
    id: "cloud", 
    label: "Cloud Integration",
    icon: FaCloud,
    lightImage: "/hero-analytics.png",
    darkImage: "/hero-analytics-dark.png"
  },
  { 
    id: "messaging", 
    label: "Team Messaging",
    icon: FaComments,
    lightImage: "/hero-analytics.png",
    darkImage: "/hero-analytics-dark.png"
  },
  { 
    id: "signature", 
    label: "E-Signatures",
    icon: FaFileSignature,
    lightImage: "/hero-analytics.png",
    darkImage: "/hero-analytics-dark.png"
  },
];

const RandomColoredText = ({ text }: { text: string }) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    // Generate random colors for each letter on mount
    const newColors = text.split('').map(() => {
      // Random value between 0 and 1
      const random = Math.random();

      if (random < 0.5) {
        return 'text-white';
      } else {
        return 'text-primary';
      }
    });
    setColors(newColors);
  }, [text]);

  if (colors.length === 0) {
    return <span>{text}</span>;
  }

  return (
    <>
      {text.split('').map((char, index) => (
        <span key={index} className={colors[index]}>
          {char}
        </span>
      ))}
    </>
  );
};

export function Hero() {

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.png"
            alt="Image Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient overlays for blending - Light mode (white) */}
        <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/40 to-white pointer-events-none z-10 dark:hidden" />
        
        {/* Gradient overlays for blending - Dark mode (black) */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black pointer-events-none z-10 hidden dark:block" />
        
        {/* Bottom fade to black overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-black via-black/50 to-transparent pointer-events-none z-20" />
        
        <div className="w-full mx-auto z-10 py-12">
          {/* Badge */}
          <div className="max-w-6xl mx-auto z-10 w-full">
          <AnimatedBadge text="Available in Beta"/>
            {/* Heading with Random Colored Text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              <RandomColoredText text="Legal Intelligence" />{" "}
              <br className="hidden sm:block" />
              <RandomColoredText text="Made Simple" />
            </motion.h1>

            {/* Description */}
           <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-lg text-gray-300 max-w-2xl mb-8"
            >
            Create, manage, and track legal documents with AI assistance. Built for teams that need compliance without complexity, ensuring every contract is secure and streamlined.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-8"
            >
              <Link href="https://app.largence.com/auth/signup" className="w-full sm:w-auto group">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full h-11 px-6 rounded-full bg-white text-black text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                >
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 px-6 rounded-full text-base transition-all duration-300 hover:scale-105 hover:bg-primary/5"
              >
                Watch Demo
              </Button>
            </motion.div>
          </div>    

          {/* Hero Image with Tabs */}
          <div className="max-w-7xl mx-auto z-10 pb-12 w-full">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-full"
            >
              <div className="relative group rounded-xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video w-full bg-muted">
                  <div className="relative aspect-video w-full">
                <Image
                  src="/hero.png"
                  alt="Largence Dashboard"
                  fill
                  className="object-cover object-top dark:hidden"
                  priority
                />
                <Image
                  src="/hero-dark.png"
                  alt="Largence Dashboard"
                  fill
                  className="object-cover object-top hidden dark:block"
                  priority
                />
              </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}