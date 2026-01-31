"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@largence/ui";
import { HiOutlineCheck, HiOutlineAcademicCap } from "react-icons/hi2";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out Largence",
    features: [
      "5 documents total",
      "10 AI generations/month",
      "50K AI tokens/month",
      "5 compliance checks/month",
      "Basic templates",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Student",
    price: "$5",
    period: "/month",
    description: "Special pricing for verified students",
    features: [
      "30 documents/month",
      "50 AI generations/month",
      "200K AI tokens/month",
      "20 compliance checks/month",
      "5 e-signatures/month",
      "2GB storage",
      "Analytics dashboard",
    ],
    cta: "Apply as Student",
    popular: false,
    isStudent: true,
  },
  {
    name: "Largence Pro",
    price: "$20",
    period: "/month",
    description: "For professionals and small legal practices",
    features: [
      "100 documents/month",
      "100 AI generations/month",
      "500K AI tokens/month",
      "50 compliance checks/month",
      "20 e-signatures/month",
      "5 team members",
      "Automated compliance",
      "DocuSign integration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Largence Max",
    price: "$100",
    period: "/month",
    description: "For growing teams and legal departments",
    features: [
      "Unlimited documents",
      "500 AI generations/month",
      "2M AI tokens/month",
      "Unlimited compliance",
      "Unlimited e-signatures",
      "25 team members",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited everything",
      "SSO (Single Sign-On)",
      "White-label option",
      "Custom AI training",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-20 md:py-28 px-4 sm:px-6 bg-muted/30" ref={sectionRef}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '3rem 3rem'
          }}
        />
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            Pricing
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade as you grow. 
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className={`relative p-5 rounded-lg border flex flex-col transition-all duration-200 hover:border-primary/50 h-full min-h-[420px] ${
                plan.popular
                  ? "border-primary bg-primary/5 md:scale-105"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm">
                  Most Popular
                </div>
              )}

              {"isStudent" in plan && plan.isStudent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-sm flex items-center gap-1">
                  <HiOutlineAcademicCap className="w-3 h-3" />
                  For Students
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-heading text-base font-semibold mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {plan.features.slice(0, 6).map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-1.5 text-xs"
                  >
                    <HiOutlineCheck className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 6 && (
                  <li className="text-xs text-muted-foreground pl-4">
                    +{plan.features.length - 6} more
                  </li>
                )}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "#contact" : "https://app.largence.com/auth/signup"}
                className="block mt-auto pt-4"
              >
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full rounded-sm h-10"
                  size="default"
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
            compliance, and regular security audits. Powered by Polar.sh.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
