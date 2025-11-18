"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@largence/ui";
import { ArrowRight } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section id="customers" className="relative py-24 px-4 sm:px-6 bg-muted/30">
      <motion.div 
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Ready to Transform Your
          <br />
          Legal Operations?
        </motion.h2>
        
        <motion.p 
          className="text-sm md:text-base lg:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join the future of legal technology in Africa. Start with a 14-day free trial, no credit card required.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="sm" variant="default" className="group" asChild>
              View Pricing
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="sm" variant="outline" asChild>
              Start Free Trial
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
