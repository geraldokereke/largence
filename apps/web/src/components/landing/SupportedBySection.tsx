"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SupporterCard, { supporters } from "../SupporterCard";

export function SupportedBySection() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
    const [isPaused, setIsPaused] = useState(false);

    return (
        <section
            className="relative py-16 md:py-24 overflow-hidden"
            ref={sectionRef}
        >
            {/* Keyframe animation defined via a style tag */}
            <style>{`
                @keyframes marquee-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                .marquee-track {
                    animation: marquee-scroll 30s linear infinite;
                }
                .marquee-track.paused {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="w-full mx-auto">
                {/* Section Label with decorative lines */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-4 mb-14 px-4 sm:px-6 lg:px-8"
                >
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-border" />
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium whitespace-nowrap">
                        Supported By
                    </p>
                    <div className="flex-1 h-px bg-linear-to-l from-transparent via-border to-border" />
                </motion.div>

                {/* Marquee Container */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-linear-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-linear-to-l from-background to-transparent pointer-events-none" />

                    {/* Scrolling track — CSS animation, paused via animation-play-state */}
                    <div
                        className={`flex w-max marquee-track${isPaused ? " paused" : ""}`}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* First set */}
                        {supporters.map((supporter) => (
                            <SupporterCard
                                key={`a-${supporter.name}`}
                                supporter={supporter}
                            />
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {supporters.map((supporter) => (
                            <SupporterCard
                                key={`b-${supporter.name}`}
                                supporter={supporter}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}