"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, startAnimation: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startAnimation]);

  return count;
}

// Animated stat component
function AnimatedStat({ 
  value, 
  label, 
  suffix = "", 
  prefix = "",
  isInView 
}: { 
  value: number; 
  label: string; 
  suffix?: string;
  prefix?: string;
  isInView: boolean;
}) {
  const count = useCountUp(value, 2000, isInView);
  
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {prefix}{count.toLocaleString()}{suffix}
        </motion.span>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

const stats = [
  { value: 10000, label: "Documents Created", suffix: "+" },
  { value: 500, label: "Legal Teams", suffix: "+" },
  { value: 98, label: "Compliance Rate", suffix: "%" },
  { value: 4.9, label: "User Rating", suffix: "/5" },
];

export function TrustedBySection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section className="relative py-16 md:py-20 px-4 sm:px-6 border-b border-border" ref={sectionRef}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-10"
        >
          Trusted by legal teams across Africa
        </motion.p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <AnimatedStat
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                isInView={isInView}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
