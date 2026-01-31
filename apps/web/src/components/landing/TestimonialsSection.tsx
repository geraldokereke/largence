"use client";

import { motion } from "framer-motion";
import { HiOutlineStar, HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";

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
    <section id="customers" className="relative py-20 md:py-28 px-4 sm:px-6 border-t border-border">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Grid */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
              Testimonials
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
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
                className="relative p-6 rounded-xl border border-border bg-card"
              >
                <HiOutlineChatBubbleBottomCenterText className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm md:text-base text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                    <HiOutlineStar key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
