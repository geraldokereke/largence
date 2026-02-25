"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { HiOutlineRocketLaunch, HiOutlineArrowRight, HiOutlinePlay, HiOutlineXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

// Fixed positions for animated dots (no random - prevents hydration issues)
const dotPositions = [
  { left: "10%", top: "20%", delay: 0, duration: 4 },
  { left: "85%", top: "15%", delay: 0.5, duration: 3.5 },
  { left: "25%", top: "70%", delay: 1, duration: 4.5 },
  { left: "70%", top: "80%", delay: 1.5, duration: 3 },
  { left: "50%", top: "30%", delay: 0.3, duration: 5 },
  { left: "15%", top: "50%", delay: 0.8, duration: 4 },
  { left: "90%", top: "60%", delay: 1.2, duration: 3.5 },
  { left: "40%", top: "85%", delay: 0.6, duration: 4.2 },
  { left: "60%", top: "10%", delay: 1.8, duration: 3.8 },
  { left: "30%", top: "40%", delay: 0.2, duration: 4.8 },
];

export function Hero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden pt-16">
        {/* Background with grid pattern */}
        <div className="absolute inset-0 -z-10">
          {/* Static grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Animated floating dots - only render after mount to avoid hydration issues */}
          {isMounted && dotPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{ left: pos.left, top: pos.top }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: pos.delay,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* Animated horizontal line */}
          {isMounted && (
            <motion.div
              className="absolute top-1/3 left-0 h-px w-32 bg-primary/20"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        <div className="w-full max-w-7xl mx-auto text-center z-10 py-12 px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="https://www.producthunt.com/posts/largence" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary mb-6 hover:bg-primary/10 transition-colors"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <HiOutlineRocketLaunch className="w-4 h-4" />
              </motion.span>
              We&apos;re live on Product Hunt
            </Link>
          </motion.div>

          {/* Static Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            The legal layer for{" "}
            <br className="hidden sm:block" />
            <span className="relative">
              <span className="text-primary">modern work</span>
              {/* Animated underline */}
              <motion.span
                className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              />
            </span>
          </motion.h1>

          {/* Description - fixed height to prevent layout shift */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 min-h-14 sm:min-h-12"
          >
            Draft, manage, and automate legal documents with AI-powered intelligence. 
            Built for teams who need compliance without complexity.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="https://app.largence.com/auth/signup" className="w-full sm:w-auto group">
              <Button
                size="lg"
                className="w-full h-12 px-8 rounded-sm text-base transition-all duration-300"
              >
                Start Free Trial
                <HiOutlineArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-sm text-base transition-all duration-300"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <HiOutlinePlay className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Video Player / Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full"
          >
            <div 
              className="relative group rounded-lg border border-border bg-card overflow-hidden shadow-2xl cursor-pointer"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <div className="relative aspect-video w-full">
                <Image
                  src="/hero-v2.png"
                  alt="Largence Dashboard"
                  fill
                  className="object-cover object-top dark:hidden"
                  priority
                />
                <Image
                  src="/hero-dark-v2.png"
                  alt="Largence Dashboard"
                  fill
                  className="object-cover object-top hidden dark:block"
                  priority
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-lg">
                    <HiOutlinePlay className="h-8 w-8 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors z-10"
              >
                <HiOutlineXMark className="h-8 w-8" />
              </button>
              <iframe
                src="https://www.youtube.com/embed/nBBQerezyF4?autoplay=1&rel=0"
                title="Largence Product Walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
