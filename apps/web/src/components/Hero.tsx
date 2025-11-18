"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { ScheduleDemoDialog } from "./schedule-demo-dialog";

export function Hero() {
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);
  return (
    <section className="relative pt-32 pb-16 px-4 sm:px-6 touch-manipulation">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 border border-border/50">
        {/* Geometric decoration */}
        <div className="absolute top-8 right-8 w-32 h-32 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Y Combinator Badge */}
            <motion.div 
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-linear-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 shadow-sm backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-center w-5 h-5 bg-orange-500 text-white font-bold text-xs rounded">
                Y
              </div>
              <span className="text-sm font-semibold text-foreground">Not Yet Backed by Y Combinator</span>
            </motion.div>
            
            <div className="space-y-4">
              <motion.h1 
                className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="text-foreground">Enterprise Legal </span>
                <span className="text-primary">Intelligence </span>
                <span className="text-foreground">for Africa</span>
              </motion.h1>
              
              <motion.p 
                className="text-xs sm:text-sm md:text-base lg:text-lg text-foreground/70 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Automate contract drafting, ensure regulatory compliance, and streamline governance 
                for African enterprises with AI-powered legal intelligence.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-row gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="https://app.largence.com/auth/signup">
                <Button size="default" className="text-sm sm:text-base group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto">
                  Get Started
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
              <Button
                onClick={() => setDemoDialogOpen(true)}
                variant="outline"
                size="default"
                className="text-sm sm:text-base group border-border/50 hover:border-border bg-background/50 backdrop-blur-sm w-full sm:w-auto"
              >
                <CalendarDays className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Schedule Demo
              </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground">Beta</div>
                <div className="text-xs text-foreground/60 font-medium">Launch Phase</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground">3</div>
                <div className="text-xs text-foreground/60 font-medium">Pilot Countries</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground">99.5%</div>
                <div className="text-xs text-foreground/60 font-medium">Uptime</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-foreground">24/7</div>
                <div className="text-xs text-foreground/60 font-medium">Support</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Screenshot */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Glow effects */}
            <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-3xl opacity-50" />
            <div className="absolute top-1/4 -left-8 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-8 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
            
            {/* Screenshot container with browser UI */}
            <div className="relative rounded-2xl border border-border/50 bg-linear-to-b from-background/80 to-background/40 backdrop-blur-xl p-3 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted/30 rounded-lg backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4 px-3 py-1 bg-background/50 rounded-md">
                  <div className="h-2 w-32 bg-muted-foreground/20 rounded" />
                </div>
              </div>
              
              {/* Screenshot - Larger and Taller */}
              <div className="relative rounded-xl overflow-hidden border border-border/30">
                <Image
                  src="/"
                  alt="Largence Dashboard"
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div 
              className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-background border border-border/50 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">GDPR Compliant</div>
                  <div className="text-xs text-foreground/60">Data privacy guaranteed</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <ScheduleDemoDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
    </section>
  );
}
