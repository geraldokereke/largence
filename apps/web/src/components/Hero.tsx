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
          Beta - Early Access
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
          Legal Intelligence{" "}<br/>
          <span className="text-primary">Made Simple</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Create, manage, and track legal documents with AI assistance. Built for teams that need compliance without complexity.
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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>In active development</span>
          </div>
          <div>Free tier available</div>
          <div>Cloud storage integrations</div>
          <div>E-signature support</div>
        </div>
      </div>
    </section>
  );
}
