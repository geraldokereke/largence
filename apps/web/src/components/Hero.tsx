"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { CalendarDays, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScheduleDemoDialog } from "./schedule-demo-dialog";

export function Hero() {
  const [demoDialogOpen, setDemoDialogOpen] = React.useState(false);

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden min-h-screen">
      <div
        className="max-w-6xl mx-auto text-center relative"
        style={{ zIndex: 10 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transparent border border-orange-400 text-sm font-medium text-gray-900 dark:text-gray-100">
            <span className="flex items-center justify-center h-5 w-5 rounded bg-orange-400">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
              >
                <rect width="20" height="20" rx="4" fill="#FF6F1A" />
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="white"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  Y
                </text>
              </svg>
            </span>
            <span className="tracking-wide">
              Not Yet Backed by Y Combinator
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
        >
          Enterprise Legal <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            Intelligence for Africa
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Automate contract drafting, ensure regulatory compliance, and
          streamline governance for African enterprises with AI-powered legal
          intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16 w-full px-2"
        >
          <span className="w-full sm:w-auto block">
            <Button
              size="lg"
              className="w-full h-12 px-6 sm:px-8 text-base sm:text-lg rounded-full transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </span>
          <Button
            onClick={() => setDemoDialogOpen(true)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 sm:px-8 text-base sm:text-lg rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Book Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="relative rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl overflow-hidden">
            <div className="relative aspect-16/10 w-full bg-muted/20">
              <Image
                src="/app.png"
                alt="Largence Dashboard"
                fill
                className="object-fit"
                priority
              />
            </div>
          </div>

          <div className="absolute -inset-4 -z-10 bg-primary/20 blur-3xl opacity-20 rounded-[3rem]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: "Launch Phase", value: "Beta" },
            { label: "Pilot Countries", value: "3" },
            { label: "Uptime", value: "99.9%" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <ScheduleDemoDialog
        open={demoDialogOpen}
        onOpenChange={setDemoDialogOpen}
      />
    </section>
  );
}
