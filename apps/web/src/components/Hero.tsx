"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@largence/ui";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
          Now available in Beta
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
          Legal Intelligence{" "}<br/>
          <span className="text-primary">for Enterprises</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          AI-powered contract drafting and compliance automation built for African enterprises.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link href="https://app.largence.com/auth/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full h-11 px-6 sm:px-8 rounded-full"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#pricing" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-11 px-6 sm:px-8 rounded-full"
            >
              View Pricing
            </Button>
          </Link>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/hero.png"
                alt="Largence Dashboard"
                fill
                className="object-cover dark:hidden"
                priority
              />
              <Image
                src="/hero-dark.png"
                alt="Largence Dashboard"
                fill
                className="object-cover hidden dark:block"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Countries", value: "54" },
            { label: "Uptime", value: "99.9%" },
            { label: "Templates", value: "100+" },
            { label: "Support", value: "24/7" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
