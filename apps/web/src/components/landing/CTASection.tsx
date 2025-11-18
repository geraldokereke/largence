"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@largence/ui";

export function CTASection() {
  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 bg-muted/30">
      <motion.div 
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 md:py-12 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Ready to Transform Your
          <br />Legal Operations?
        </motion.h2>
        <motion.p 
          className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join hundreds of enterprises using Largence to streamline their legal workflows and ensure compliance across Africa.
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="https://app.largence.com/auth/signup">
            <Button size="lg" variant="default" className="text-base cursor-pointer">
              Start Free Trial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="#contact">
            <Button size="lg" variant="outline" className="text-base cursor-pointer">
              Contact Sales
            </Button>
          </Link>
        </motion.div>
        <p className="text-sm text-muted-foreground">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </motion.div>
    </section>
  );
}
