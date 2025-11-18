"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@largence/ui";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "Perfect for small legal teams getting started",
    features: [
      "Up to 5 team members",
      "100 contracts/month",
      "AI contract drafting",
      "Basic templates library",
      "Email support",
      "5 GB storage"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$799",
    period: "/month",
    description: "For growing legal departments",
    features: [
      "Up to 20 team members",
      "Unlimited contracts",
      "Advanced AI features",
      "Custom templates",
      "Priority support",
      "50 GB storage",
      "Compliance automation",
      "Analytics & reporting"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for large organizations",
    features: [
      "Unlimited team members",
      "Unlimited contracts",
      "Custom AI training",
      "Dedicated account manager",
      "24/7 premium support",
      "Unlimited storage",
      "Advanced security",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 touch-manipulation">
      <motion.div 
        className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 rounded-xl border border-border/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 md:mb-6">
            Pricing Plans
          </div>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Choose the Right Plan for Your Team
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            Transparent pricing with no hidden fees. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative p-6 md:p-8 rounded-xl border transition-all flex flex-col ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-xl scale-105'
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.name === "Enterprise" ? "#contact" : "/signup"} className="block mt-auto">
                <Button 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  className="w-full cursor-pointer"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            All plans include: SOC 2 compliance, 256-bit encryption, GDPR compliance, and regular security audits
          </p>
          <Link href="#contact" className="text-sm text-primary hover:underline">
            Need a custom plan? Contact our sales team →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
