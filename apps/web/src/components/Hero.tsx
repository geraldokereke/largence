"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { DemoVideoModal } from "./DemoVideoModal";

// Dynamically import AnimatedBackground to avoid SSR issues with Three.js
const AnimatedBackground = dynamic(
  () => import("./AnimatedBackground").then((mod) => mod.AnimatedBackground),
  { ssr: false }
);

export function Hero() {
  // Video is always visible, no modal

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden pt-16">
        <AnimatedBackground />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center z-10 py-12 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-sm font-medium text-primary mb-6">
              Available in Beta
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            Legal Intelligence{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">Made Simple</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Create, manage, and track legal documents with AI assistance. Built for teams that need compliance without complexity.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Link href="https://app.largence.com/auth/signup" className="w-full sm:w-auto group">
              <Button
                size="lg"
                className="w-full h-12 px-8 rounded-full text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-full text-base transition-all duration-300 hover:scale-105 hover:bg-primary/5"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full"
          >
            <div className="relative group rounded-xl border bg-card overflow-hidden shadow-2xl">
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
          </motion.div>
        </div>
      </section>

      {/* No modal, video is always visible */}
    </>
  );
}
