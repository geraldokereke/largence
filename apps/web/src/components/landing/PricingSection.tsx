"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@largence/ui";
import { Check } from "lucide-react";
import { motion, useInView } from "framer-motion";

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
      "5 GB storage",
    ],
    cta: "Start Free Trial",
    popular: false,
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
      "Analytics & reporting",
    ],
    cta: "Start Free Trial",
    popular: true,
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
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 sm:px-6" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Choose the Right Plan for Your Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. All plans include a 14-day
            free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className={`relative p-6 rounded-lg border flex flex-col transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-heading text-lg font-semibold mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "#contact" : "https://app.largence.com/auth/signup"}
                className="block mt-auto"
              >
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground">
            All plans include: SOC 2 compliance, 256-bit encryption, GDPR
            compliance, and regular security audits
          </p>
        </motion.div>
      </div>
    </section>
  );
}
