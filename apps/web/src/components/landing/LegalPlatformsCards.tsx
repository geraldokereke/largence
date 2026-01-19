import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, CheckCircle } from 'lucide-react';

const LegalPlatformCards = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
    {
      id: 1,
      number: "01",
      label: "THE PROBLEM",
      title: "Legal Work Is Fragmented",
      oneLiner: "Too many tools. Too much risk.",
      expandedTitle: "Legal Teams Are Slowed by Fragmentation",
      description: "Documents, approvals, compliance checks, and communication live across disconnected systems, increasing errors, delays, and regulatory exposure.",
      bullets: [
        "Manual drafting and reviews",
        "Scattered conversations and files",
        "Limited visibility and auditability"
      ],
      icon: AlertCircle
    },
    {
      id: 2,
      number: "02",
      label: "OUR SOLUTION",
      title: "One Intelligent Platform",
      oneLiner: "Everything legal teams need, unified.",
      expandedTitle: "A Unified Legal Intelligence Platform",
      description: "Our platform brings document automation, compliance monitoring, collaboration, and secure execution into a single, intelligent workspace.",
      bullets: [
        "AI-powered drafting and review",
        "Real-time compliance insights",
        "Centralized collaboration and workflows"
      ],
      icon: Zap
    },
    {
      id: 3,
      number: "03",
      label: "THE RESULT",
      title: "Faster, Safer Legal Work",
      oneLiner: "Confidence at every step.",
      expandedTitle: "Operate with Speed, Accuracy, and Confidence",
      description: "Legal teams reduce risk, accelerate execution, and gain full control over their workflows—without adding complexity.",
      bullets: [
        "Reduced compliance risk",
        "Faster turnaround times",
        "Clear accountability and audit trails"
      ],
      icon: CheckCircle
    }
  ];

  const getCardWidth = (cardId: number) => {
    if (hoveredCard === null) return "w-4/12";
    if (hoveredCard === cardId) return "w-6/12";
    return "w-3/12";
  };

  const getCardScale = (cardId: number) => {
    if (hoveredCard === null) return 1;
    if (hoveredCard === cardId) return 1.02;
    return 0.98;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-transparent pt-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">
              From Complexity to Clarity
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A unified platform designed for modern legal teams
            </p>
          </motion.div>
        </div>

        <div className="flex gap-4 items-stretch">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: getCardScale(card.id)
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                }}
                className={`${getCardWidth(card.id)} transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-125 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden group">
                
                  <div className="p-10 h-full flex flex-col relative z-10">
                    {/* Header Section */}
                    <div className="mb-auto">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-display font-bold text-white">{card.number}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className={`text-xs font-semibold ${isHovered ? "text-primary/50" : "text-gray-500"} uppercase tracking-widest transition-colors duration-300`}>
                          {card.label}
                        </span>
                      </div>
                    </div>

                    {/* Collapsed State Content */}
                    <motion.div
                      animate={{
                        opacity: isHovered ? 0 : 1,
                        y: isHovered ? -20 : 0,
                        scale: isHovered ? 0.95 : 1
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                      className={`${isHovered ? 'pointer-events-none' : ''}`}
                    >
                      <h3 className="text-3xl font-bold mb-4 leading-tight font-display text-white">
                        {card.title}
                      </h3>
                      <p className="text-gray-400 text-lg leading-relaxed">
                        {card.oneLiner}
                      </p>
                    </motion.div>

                    {/* Expanded State Content */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: 0.15 }}
                          className="absolute inset-0 p-10 pt-44"
                        >
                          <h3 className="text-2xl font-bold mb-4 font-display leading-tight text-white">
                            {card.expandedTitle}
                          </h3>
                          
                          <p className="text-gray-400 mb-8 leading-relaxed text-base">
                            {card.description}
                          </p>

                          {/* Bullets */}
                          <div className="space-y-4">
                            {card.bullets.map((bullet, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + (idx * 0.1) }}
                                className="flex items-center gap-3"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                <span className="text-gray-300 text-sm">{bullet}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                       style={{
                         backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                         backgroundSize: '50px 50px'
                       }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LegalPlatformCards;