import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Lock, FileCheck, Brain, Globe, Server } from "lucide-react";

export default function SecurityPage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Data Protection",
      description: "All data is encrypted in transit and at rest using modern cryptographic standards to prevent unauthorized access.",
      bullets: [
        "TLS encryption in transit",
        "Encrypted storage at rest",
        "Secure key management"
      ]
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      description: "Granular permissions ensure users only access what they are authorized to see or manage.",
      bullets: [
        "Role-based permissions",
        "Principle of least privilege",
        "Secure authentication flows"
      ]
    },
    {
      icon: FileCheck,
      title: "Full Audit Trails",
      description: "Every action is logged to provide transparency, traceability, and accountability across your legal workflows.",
      bullets: [
        "User activity logs",
        "Time-stamped records",
        "Exportable audit data"
      ]
    },
    {
      icon: Brain,
      title: "Secure AI Processing",
      description: "AI-powered analysis is designed with strict data isolation and privacy safeguards at every stage.",
      bullets: [
        "No cross-customer data leakage",
        "Controlled model interactions",
        "Privacy-first architecture"
      ]
    },
    {
      icon: Globe,
      title: "Compliance-Ready by Design",
      description: "Built to support regulatory and industry requirements commonly faced by legal teams.",
      bullets: [
        "Data residency options",
        "GDPR-ready workflows",
        "Secure data handling policies"
      ]
    },
    {
      icon: Server,
      title: "Hardened Cloud Infrastructure",
      description: "Deployed on secure, enterprise-grade cloud infrastructure with continuous monitoring and protection.",
      bullets: [
        "Network isolation",
        "Continuous monitoring",
        "Regular security updates"
      ]
    }
  ];

  return (
    <section 
      id="security" 
      ref={sectionRef}
      className="relative py-24 px-4 bg-linear-to-b from-background via-background to-muted/20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Enterprise-Grade Security
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your data is protected by industry-leading security practices, designed for the demands of modern legal teams.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}