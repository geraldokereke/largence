"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { HiOutlineRocketLaunch, HiOutlineGlobeAlt } from "react-icons/hi2";
import { Button } from "@largence/ui";

export function ProductHuntSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-16 md:py-20 px-4 sm:px-6 bg-muted/20" ref={sectionRef}>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '1.5rem 1.5rem'
          }}
        />
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 md:p-10 rounded-lg border border-border bg-card"
        >
          {/* Content */}
          <div className="text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium mb-4">
              <HiOutlineRocketLaunch className="w-4 h-4" />
              Now Live on Product Hunt
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Support us on Product Hunt
            </h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re building the future of legal document management for teams and enterprises. 
              Your upvote helps us reach more teams who need better legal tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="https://www.producthunt.com/posts/largence" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="h-12 px-8 rounded-sm">
                  <HiOutlineRocketLaunch className="w-4 h-4 mr-2" />
                  Support Us on Product Hunt
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HiOutlineGlobeAlt className="w-5 h-5 text-primary" />
                <span>Built for Legal Teams</span>
              </div>
            </div>
          </div>

          {/* Product Hunt Embed */}
          <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-end">
            <a 
              href="https://www.producthunt.com/products/largence?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-largence" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1070785&theme=light&t=1769878959999" 
                alt="Largence - Legal layer for modern work | Product Hunt" 
                width={250} 
                height={54}
                className="dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1070785&theme=dark&t=1769878959999" 
                alt="Largence - Legal layer for modern work | Product Hunt" 
                width={250} 
                height={54}
                className="hidden dark:block"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
