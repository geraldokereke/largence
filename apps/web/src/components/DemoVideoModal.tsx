"use client";

import { useState } from "react";
import { X, Play } from "lucide-react";
import { Button } from "@largence/ui";
import Image from "next/image";

interface DemoVideoModalProps {
  open: boolean;
  onClose: () => void;
}

export function DemoVideoModal({ open, onClose }: DemoVideoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-background rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="aspect-video relative bg-muted">
          {/* Professional video player */}
          <video
            src="/demo.mp4"
            poster="/hero.png"
            controls
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-contain rounded-b-lg bg-black"
          />
        </div>
        
        <div className="p-6 border-t">
          <h3 className="font-semibold text-lg mb-2">Product Walkthrough</h3>
          <p className="text-sm text-muted-foreground">
            See how Largence helps you create, manage, and collaborate on legal documents.
          </p>
        </div>
      </div>
    </div>
  );
}
