import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
  size: 'small' | 'medium' | 'large';
}

export default function FAQ() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const faqs: FAQ[] = [
    {
      question: "How do I get started?",
      answer: "Just sign up, complete your profile, and you're ready to go!",
      size: "small"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support PayPal, Apple Pay, Google Pay, and bank transfers for enterprise customers. All payments are processed securely through our encrypted payment gateway with PCI DSS compliance.",
      size: "large"
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! 14-day free trial with full access. No credit card required.",
      size: "small"
    },
    {
      question: "How does the pricing work?",
      answer: "Our pricing is flexible and scales with your needs. We offer monthly and annual billing options, with discounts for annual subscriptions. You can upgrade, downgrade, or cancel anytime without penalties.",
      size: "medium"
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, anytime. Your access continues until billing period ends.",
      size: "small"
    },
    {
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 customer support through multiple channels including live chat, email, and phone. Premium users get priority support with dedicated account managers. We also have an extensive knowledge base, video tutorials, and community forums where you can find answers and connect with other users.",
      size: "large"
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. We use bank-level 256-bit encryption, regular security audits, and comply with GDPR, SOC 2, and HIPAA standards.",
      size: "medium"
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes! 30-day money-back guarantee, no questions asked.",
      size: "small"
    },
    {
      question: "Can I integrate with other tools?",
      answer: "Yes! We offer native integrations with over 100+ popular tools including Slack, Google Workspace, Microsoft 365, Salesforce, and more. Our REST API also allows custom integrations.",
      size: "medium"
    },
    {
      question: "What's included in the free plan?",
      answer: "Basic features, 5 projects, 2GB storage, and community support.",
      size: "small"
    },
    {
      question: "How do I upgrade my account?",
      answer: "Upgrading is easy! Go to your account settings, select the plan you want, and complete the payment process. Your upgrade takes effect immediately and you'll be prorated for any unused time on your current plan.",
      size: "medium"
    },
    {
      question: "Do you offer team plans?",
      answer: "Yes! We offer special team and enterprise plans with collaborative features, advanced permissions, centralized billing, and volume discounts. Teams of 10+ get dedicated onboarding and training sessions.",
      size: "large"
    },
    {
      question: "Can I export my data?",
      answer: "Absolutely! Export anytime in CSV, JSON, or PDF formats.",
      size: "small"
    },
    {
      question: "What browsers do you support?",
      answer: "All modern browsers: Chrome, Firefox, Safari, and Edge.",
      size: "small"
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! Native iOS and Android apps with full feature parity. Download from the App Store or Google Play.",
      size: "medium"
    },
    {
      question: "How often do you release updates?",
      answer: "We continuously improve our platform with weekly minor updates and major feature releases quarterly. All updates are automatic and require no downtime.",
      size: "medium"
    },
    {
      question: "Can I customize my workspace?",
      answer: "Yes! Our platform offers extensive customization options including themes, layouts, custom fields, branded domains, and personalized dashboards to match your workflow.",
      size: "large"
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "We'll notify you before you reach limits. You can upgrade or we'll soft-lock certain features until next billing cycle.",
      size: "medium"
    }
  ];

  // Distribute FAQs into 4 columns
  const columns = [
    faqs.filter((_, i) => i % 4 === 0),
    faqs.filter((_, i) => i % 4 === 1),
    faqs.filter((_, i) => i % 4 === 2),
    faqs.filter((_, i) => i % 4 === 3),
  ];

  const toggleCard = (colIndex: number, cardIndex: number): void => {
    const cardId = `${colIndex}-${cardIndex}`;
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const getSizeClasses = (size: 'small' | 'medium' | 'large'): string => {
    switch(size) {
      case 'small':
        return 'h-40';
      case 'medium':
        return 'h-56';
      case 'large':
        return 'h-72';
      default:
        return 'h-40';
    }
  };

  return (
    <section id='faq' className="min-h-screen py-16 px-4 overflow-hidden" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our service
          </p>
        </motion.div>

        <div className="relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-170 overflow-hidden"
          >
            {columns.map((columnFaqs, colIndex) => {
              const direction = colIndex % 2 === 0 ? 'up' : 'down';
              const animationClass = direction === 'up' ? 'animate-scroll-up' : 'animate-scroll-down';
              
              return (
                <motion.div 
                  key={colIndex} 
                  className="relative overflow-hidden"
                  initial={{ opacity: 0, x: colIndex % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + (colIndex * 0.1) }}
                >
                  <div className={`flex flex-col gap-4 ${animationClass}`}>
                    {/* Duplicate the content for seamless loop */}
                    {[...columnFaqs, ...columnFaqs].map((faq, index) => {
                      const originalIndex = index % columnFaqs.length;
                      const cardId = `${colIndex}-${index}`;
                      const isExpanded = expandedCards.has(cardId);
                      
                      return (
                        <div
                          key={index}
                          className={`${getSizeClasses(faq.size)} shrink-0`}
                        >
                          <div className="h-full bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary overflow-hidden">
                            <button
                              onClick={() => toggleCard(colIndex, index)}
                              className="w-full p-6 text-left flex items-start justify-between gap-3 transition-colors h-full"
                            >
                              <div className="flex-1">
                                <h3 className="font-heading text-lg font-semibold mb-1">
                                  {faq.question}
                                </h3>
                                <div
                                  className={`transition-all duration-300 overflow-hidden ${
                                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                  }`}
                                >
                                  <div className="h-px bg-white/20 mb-3"></div>
                                  <p className="text-sm text-white/40 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                              <ChevronDown 
                                className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Overlay gradients for blending */}
          <div className="pointer-events-none absolute inset-0">
            {/* Top overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-background to-transparent"></div>
            {/* Bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent"></div>
            {/* Left overlay */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-linear-to-r from-background to-transparent"></div>
            {/* Right overlay */}
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-linear-to-l from-background to-transparent"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }
        
        .animate-scroll-up:hover,
        .animate-scroll-down:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}