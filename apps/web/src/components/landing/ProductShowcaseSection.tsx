"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
} from "react-icons/hi2";

const showcaseItems = [
  {
    title: "AI Document Drafting",
    description:
      "Generate legal documents in seconds with our advanced AI. Simply describe what you need, and watch the magic happen.",
    icon: HiOutlineSparkles,
    image: "/hero-v2.png",
    imageDark: "/hero-dark-v2.png",
  },
  {
    title: "Advanced Analytics",
    description:
      "Track document performance, team productivity, and compliance metrics with beautiful, actionable dashboards.",
    icon: HiOutlineChartBar,
    image: "/hero-dark-v2.png",
    imageDark: "/hero-v2.png",
  },
  {
    title: "Multi-Jurisdiction Support",
    description:
      "Draft documents with built-in guidance tailored to different jurisdictions and legal frameworks.",
    icon: HiOutlineGlobeAlt,
    image: "/hero-v2.png",
    imageDark: "/hero-dark-v2.png",
  },
];

export function ProductShowcaseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product-tour"
      className="relative py-20 md:py-28 px-4 sm:px-6 overflow-hidden bg-muted/30 border-y border-border"
    >
      {/* Grid background pattern - consistent with other sections */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        {/* Animated horizontal lines - only after mount */}
        {isMounted && (
          <>
            <motion.div
              className="absolute top-1/3 left-0 w-20 h-px bg-primary/30"
              animate={{ x: ["0%", "500%", "0%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-2/3 right-0 w-28 h-px bg-primary/20"
              animate={{ x: ["0%", "-300%", "0%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - consistent with other sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
            Product Tour
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Built for{" "}
            <span className="relative inline-block">
              Modern Legal Teams
              <motion.span
                className="absolute -bottom-1 left-0 h-1 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              />
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every feature designed to make legal work easier, faster, and more
            reliable.
          </p>
        </motion.div>

        {/* Showcase Items */}
        <div className="space-y-16">
          {showcaseItems.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
              >
                {/* Content */}
                <motion.div 
                  className={isEven ? "lg:order-1" : "lg:order-2"}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Icon className="w-4 h-4" />
                    Feature {index + 1}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-4">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Smart Templates",
                      "Auto-Save",
                      "Version History",
                      "Export Options",
                    ].map((pill, pillIndex) => (
                      <motion.span
                        key={pill}
                        className="px-3 py-1 rounded-sm bg-muted text-sm text-muted-foreground border border-border"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 + pillIndex * 0.05 }}
                      >
                        {pill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Image */}
                <motion.div 
                  className={isEven ? "lg:order-2" : "lg:order-1"}
                  initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative rounded-lg border border-border overflow-hidden bg-card shadow-lg">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover object-top dark:hidden"
                      />
                      <Image
                        src={item.imageDark}
                        alt={item.title}
                        fill
                        className="object-cover object-top hidden dark:block"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: HiOutlineShieldCheck,
              title: "Enterprise Security",
              desc: "Bank-grade encryption and compliance certifications",
            },
            {
              icon: HiOutlineUserGroup,
              title: "Team Management",
              desc: "Roles, permissions, and audit trails built-in",
            },
            {
              icon: HiOutlineDocumentText,
              title: "Template Library",
              desc: "50+ professionally crafted legal templates",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -2 }}
                className="p-6 rounded-lg border border-border bg-card transition-colors hover:border-primary/30"
              >
                <motion.div 
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
