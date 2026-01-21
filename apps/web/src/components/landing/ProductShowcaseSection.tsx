"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Sparkles, BarChart3, Globe, Shield, Users, FileText } from "lucide-react";

const stats = [
  { value: "70%", label: "Faster Document Creation" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "50+", label: "Document Templates" },
  { value: "24/7", label: "Support Available" },
];

const showcaseItems = [
  {
    title: "AI Document Drafting",
    description: "Generate legal documents in seconds with our advanced AI. Simply describe what you need, and watch the magic happen.",
    icon: Sparkles,
    image: "/hero-v2.png",
    imageDark: "/hero-dark-v2.png",
    gradient: "from-purple-500/20 via-transparent to-transparent",
  },
  {
    title: "Advanced Analytics",
    description: "Track document performance, team productivity, and compliance metrics with beautiful, actionable dashboards.",
    icon: BarChart3,
    image: "/hero-dark-v2.png",
    imageDark: "/hero-v2.png",
    gradient: "from-blue-500/20 via-transparent to-transparent",
  },
  {
    title: "Multi-Jurisdiction Support",
    description: "Create documents compliant with legal requirements across multiple African jurisdictions and beyond.",
    icon: Globe,
    image: "/hero-v2.png",
    imageDark: "/hero-dark-v2.png",
    gradient: "from-green-500/20 via-transparent to-transparent",
  },
];

export function ProductShowcaseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-4 sm:px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-background border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Built for <span className="text-primary">Modern Legal Teams</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature designed to make legal work easier, faster, and more reliable.
          </p>
        </motion.div>

        {/* Showcase Items */}
        <div className="space-y-20">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <item.icon className="w-4 h-4" />
                  Feature Spotlight
                </div>
                <h3 className="font-display text-2xl md:text-4xl font-bold mb-4">
                  {item.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {["Smart Templates", "Auto-Save", "Version History", "Export Options"].map((pill) => (
                    <span
                      key={pill}
                      className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className={`relative group ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className={`absolute -inset-4 bg-gradient-to-r ${item.gradient} rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`} />
                
                <div className="relative rounded-2xl border-2 border-primary/20 overflow-hidden shadow-2xl">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/80 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  
                  <div className="relative aspect-[4/3] w-full">
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
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and compliance certifications" },
            { icon: Users, title: "Team Management", desc: "Roles, permissions, and audit trails built-in" },
            { icon: FileText, title: "Template Library", desc: "50+ professionally crafted legal templates" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
              className="p-6 rounded-2xl border bg-background hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
