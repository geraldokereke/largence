"use client";

import { motion } from "framer-motion";
import { Button } from "@largence/ui";
import { ArrowRight, Star, Quote } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    quote: "Largence has transformed how we handle contracts across our African operations. The AI drafting saves us hours every week.",
    author: "Sarah Mensah",
    role: "General Counsel",
    company: "TechCorp Africa",
  },
  {
    quote: "The compliance monitoring feature alone is worth the investment. We are always ahead of regulatory changes now.",
    author: "David Okonkwo",
    role: "Legal Director",
    company: "Pan-African Holdings",
  },
  {
    quote: "Finally, a legal tech platform built for African businesses. The jurisdiction coverage is unmatched.",
    author: "Amara Diallo",
    role: "Head of Legal",
    company: "Sahel Ventures",
  },
];

export function TestimonialsSection() {
  return (
    <section id="customers" className="relative py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Testimonials Grid */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
              Trusted by Legal Teams
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-sm md:text-base text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="py-16 md:py-20 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center"
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
            Join the future of legal technology in Africa. Start with a 14-day
            free trial, no credit card required.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="#pricing">
              <Button size="sm" variant="default" className="group">
                View Pricing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://app.largence.com">
              <Button size="sm" variant="outline">
                Start Free Trial
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
