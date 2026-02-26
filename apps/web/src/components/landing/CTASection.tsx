"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@largence/ui";
import { HiOutlineArrowRight, HiOutlineCheckCircle } from "react-icons/hi2";

const benefits = ["No credit card required", "14-day free trial", "Cancel anytime"];

export function CTASection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 bg-muted/30 border-t border-border overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        {/* Animated circles - only after mount */}
        {isMounted && (
          <>
            <motion.div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border-2 border-primary/15"
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </>
        )}
      </div>
      <motion.div
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 rounded-xl border border-border bg-card text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Ready to Transform Your
          <br />
          <span className="relative inline-block">
            Legal Operations?
            <motion.span
              className="absolute -bottom-1 left-0 h-[3px] bg-primary rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            />
          </span>
        </motion.h2>
        <motion.p
          className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
         Join hundreds of enterprises using Largence to streamline legal workflows and ensure compliance wherever they do business.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="https://app.largence.com/auth/signup">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="default"
                className="h-12 px-8 rounded-sm group"
              >
                Start Free Trial
                <HiOutlineArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          <Link href="/contact">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-sm"
              >
                Contact Sales
              </Button>
            </motion.div>
          </Link>
        </motion.div>
        {/* Animated benefits */}
        <div className="flex flex-wrap justify-center gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1, type: "spring" }}
              >
                <HiOutlineCheckCircle className="w-4 h-4 text-primary" />
              </motion.div>
              {benefit}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
