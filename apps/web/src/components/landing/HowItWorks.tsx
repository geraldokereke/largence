"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, Sparkles, CheckCircle, Send } from "lucide-react";
import ScrollFloat from "../ScrollFloat";

export default function HowItWorks() {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerHeight = "300vh";

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const [targetX, setTargetX] = useState("-140%"); // Default to desktop to match server mismatch if any, or standard.

  useEffect(() => {
    const updateTarget = () => {
      // Mobile breakpoint check (md is usually 768px in Tailwind)
      if (window.innerWidth < 768) {
        // Mobile needs significantly more scroll because content is much wider (~390vw vs 100vw viewport)
        setTargetX("-280%");
      } else {
        setTargetX("-140%");
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], ["5%", targetX]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1, 0]);

  const howItWorksSteps = [
    {
      number: "01",
      icon: FileText,
      title: "Create or Import",
      description: "Start from scratch, use AI to draft, or import existing documents from your cloud storage.",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "AI Enhancement",
      description: "Our AI reviews your document, suggests improvements, and ensures legal accuracy.",
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Compliance Check",
      description: "Automated compliance analysis flags potential issues before they become problems.",
    },
    {
      number: "04",
      icon: Send,
      title: "Sign & Share",
      description: "Send for e-signature, share with your team, and track everything in one place.",
    },
  ];

  return (
    <section id="howitworks" ref={targetRef} style={{ height: containerHeight }} className="relative bg-background">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

        {/* Header */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="absolute top-24 md:top-32 left-0 right-0 z-20 text-center px-6"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-foreground">
            The Workflow in Motion
          </h2>
          <p className="text-base md:text-xl text-muted-foreground font-display max-w-xl mx-auto">
            Every step designed to accelerate legal work with intelligence and clarity.
          </p>
        </motion.div>

        {/* Horizontal Scroll Track */}
        <motion.div
          style={{ x }}
          className="flex gap-6 md:gap-8 px-6 md:px-12 items-center z-10 lg:mt-40 xl:mt-34 2xl:mt-32"
        >
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="h-[50vh] md:h-[55vh] w-[85vw] md:w-[45vw] lg:w-[32vw] shrink-0"
              >
                <div className="relative h-full w-full bg-card border border-border rounded-3xl shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-700 overflow-hidden group">

                  <div className="p-10 h-full flex flex-col relative z-10">
                    {/* Header Section */}
                    <div className="mb-auto">
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <span className="text-3xl md:text-5xl font-display font-bold text-foreground">{step.number}</span>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          STEP {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1" />

                    <div>
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 leading-tight font-display text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Progress */}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${((index + 1) / howItWorksSteps.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}/{howItWorksSteps.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                      backgroundSize: '50px 50px'
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* End Card */}
          <div className="h-[55vh] w-[50vw] md:w-[30vw] shrink-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-xl md:text-2xl font-semibold mb-3">
                Ready to get started?
              </p>
              <p className="text-base text-muted-foreground">
                Try it free for 14 days
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full">
            <span className="text-xs text-muted-foreground">Scroll to explore</span>
            <div className="flex gap-1">
              {howItWorksSteps.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-muted transition-all duration-300"
                  style={{
                    backgroundColor: scrollYProgress.get() > index / howItWorksSteps.length ? 'hsl(var(--primary))' : undefined
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}