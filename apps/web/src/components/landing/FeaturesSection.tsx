"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FileText, Shield, Users, Cloud, MessageSquare, FileSignature, ChevronRight } from "lucide-react";
import ScrollStack, { ScrollStackItem } from '../ScrollStack'

// Features Demo
const features = [
  {
    id: "documents",
    icon: FileText,
    title: "Document Creation",
    description: "Create legal documents from templates or use AI to help draft new ones. Export to DOCX when needed.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance Checks",
    description: "Run automated compliance analysis on your documents. Get flagged for potential issues.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Team Collaboration",
    description: "Share documents with your team, set permissions, and track changes. Work together in one place.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Integration",
    description: "Import from and sync to Dropbox, Google Drive, and Notion. Keep your files where you need them.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "messaging",
    icon: MessageSquare,
    title: "Team Messaging",
    description: "Discuss documents and matters with your team in organized channels. No more email threads.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "signatures",
    icon: FileSignature,
    title: "E-Signatures",
    description: "Send documents for signature via DocuSign integration. Track signing status in real-time.",
    gradient: "from-pink-500 to-rose-500",
  },
];

export default function FeaturesSection() {
  const [stackComplete, setStackComplete] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Powerful Features
          </h1>
          <p className="text-xl text-slate-600">
            Everything you need to manage your legal workflow
          </p>
        </div>

        <ScrollStack
          itemDistance={80}
          itemScale={0.05}
          itemStackDistance={40}
          stackPosition="25%"
          scaleEndPosition="15%"
          baseScale={0.9}
          rotationAmount={2}
          blurAmount={1}
          onStackComplete={() => setStackComplete(true)}
        >
          {features.map((feature, index) => (
            <ScrollStackItem key={feature.id} itemClassName="feature-card">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden min-h-125 border border-slate-200">
                <div className={`h-2 bg-linear-to-r ${feature.gradient}`} />
                <div className="p-8">
                  <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${feature.gradient} mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                      <p className="text-slate-700">
                        Seamless integration with your existing workflow
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                      <p className="text-slate-700">
                        Enterprise-grade security and compliance
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                      <p className="text-slate-700">
                        24/7 support from our dedicated team
                      </p>
                    </div>
                  </div>
                  <div className={`mt-8 p-6 rounded-xl bg-linear-to-br ${feature.gradient} bg-opacity-10`}>
                    <div className="text-6xl font-bold bg-linear-to-r ${feature.gradient} bg-clip-text text-transparent">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>

        {stackComplete && (
          <div className="text-center mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-green-700 font-medium">✓ Stack completed!</p>
          </div>
        )}
      </div>

      <style>{`
        .scroll-stack-scroller {
          height: 100vh;
          overflow-y: auto;
          position: relative;
        }

        .scroll-stack-inner {
          position: relative;
          padding: 2rem 0;
        }

        .scroll-stack-card {
          position: relative;
          z-index: 1;
        }

        .scroll-stack-end {
          height: 100vh;
          pointer-events: none;
        }

        .feature-card {
          transition: filter 0.3s ease;
        }
      `}</style>
    </div>
  );
}