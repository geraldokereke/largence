"use client"
import { LoginForm } from "@largence/components/login-form";
import { motion } from "framer-motion";
import Image from "next/image";


const features = [
  {
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    title: "AI Document Drafting",
    description: "Generate contracts, NDAs, employment agreements, and policies with AI. Customize by jurisdiction, add clauses, and export as PDF or DOCX.",
    features: ["Multi-country templates", "Smart clause suggestions"],
    animationClass: "animate-text-fade-1",
    opacity: "opacity-100"
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Compliance Auditing",
    description: "AI audits documents for compliance gaps, missing clauses, and regulatory alignment across NDPR, GDPR, CCPA, and African data protection laws.",
    features: ["Compliance scoring", "Risk flagging"],
    animationClass: "animate-text-fade-2",
    opacity: "opacity-0"
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Enterprise Governance",
    description: "Manage document lifecycle with approval workflows, role-based access, audit trails, and e-signature integration. Full accountability.",
    features: ["Approval workflows", "Audit trails"],
    animationClass: "animate-text-fade-3",
    opacity: "opacity-0"
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    title: "Multi-Country Templates",
    description: "Access legally-reviewed templates for Nigeria, Ghana, Kenya, and South Africa. Localized for employment acts, data laws, and compliance frameworks.",
    features: ["Region-specific", "Pre-vetted clauses"],
    animationClass: "animate-text-fade-4",
    opacity: "opacity-0"
  }
];

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
);

const FeatureSlide = ({ feature, index }: { feature: typeof features[0], index: number }) => (
  <div className={`absolute inset-0 ${feature.opacity} transition-opacity duration-500 ${feature.animationClass}`}>
    <div className="bg-white/5 backdrop-blur-sm rounded-sm p-8 border border-white/10 h-full flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center space-x-4 mb-5">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-sm flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
            </svg>
          </div>
          <h3 className="text-white text-2xl font-semibold tracking-tight font-(family-name:--font-general-sans)">{feature.title}</h3>
        </div>
        <p className="text-slate-300 leading-relaxed text-base">{feature.description}</p>
      </div>
      <div className="flex items-center gap-6 text-sm text-slate-400 mt-6 pt-4 border-t border-white/5">
        {feature.features.map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <CheckIcon />
            {item}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image 
              src="/logo.png" 
              alt="Largence Logo" 
              width={32} 
              height={32}
              className="shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight font-(family-name:--font-general-sans)">Largence</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="absolute inset-0 flex flex-col p-12 lg:p-16">
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight font-(family-name:--font-general-sans)"
            >
              Enterprise Legal Intelligence Platform
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-xl text-slate-300 leading-relaxed mb-12"
            >
              Transform your legal operations with <span className="font-semibold">AI powered</span> contract generation, 
              <span className="font-semibold"> intelligent</span> compliance monitoring, and 
              <span className="font-semibold"> automated</span> governance workflows. Built for 
              <span className="font-semibold"> global enterprises</span> managing 
              complex regulatory requirements across <span className="font-semibold">multiple jurisdictions</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="relative h-72 mb-8 overflow-hidden"
            >
              {features.map((feature, index) => (
                <FeatureSlide key={index} feature={feature} index={index} />
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center gap-2"
            >
              <div className="w-12 h-1 rounded-full bg-emerald-400/60 animate-progress-1"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-2"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-3"></div>
              <div className="w-12 h-1 rounded-full bg-white/10 animate-progress-4"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
