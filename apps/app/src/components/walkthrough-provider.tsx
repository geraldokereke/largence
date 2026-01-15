"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  InteractiveWalkthrough,
  APP_WALKTHROUGH_STEPS,
} from "@/components/interactive-walkthrough";

interface WalkthroughContextType {
  startWalkthrough: () => void;
  hasCompletedWalkthrough: () => boolean;
  resetWalkthrough: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

// Single walkthrough key for the entire app
const WALKTHROUGH_KEY = "largence:app-walkthrough-completed";

// Pages where the walkthrough can be triggered (pages with sidebar visible)
const WALKTHROUGH_TRIGGER_PAGES = ["/", "/dashboard", "/documents", "/matters", "/messages", "/templates", "/compliance", "/analytics", "/teams"];

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Load completion status from user metadata or localStorage
  useEffect(() => {
    if (!isLoaded) return;

    const loadCompletionStatus = async () => {
      // Check localStorage first for immediate response
      const localCompleted = localStorage.getItem(WALKTHROUGH_KEY);
      if (localCompleted === "true") {
        setHasCompleted(true);
        return;
      }

      // Check user metadata
      if (user) {
        const userMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        if (userMetadata.appWalkthroughCompleted === true) {
          setHasCompleted(true);
          // Sync to localStorage for faster future checks
          localStorage.setItem(WALKTHROUGH_KEY, "true");
          return;
        }
      }

      setHasCompleted(false);
    };

    loadCompletionStatus();
  }, [user, isLoaded]);

  // Auto-show walkthrough on first visit to an eligible page
  useEffect(() => {
    if (!isLoaded || hasCompleted === null || hasCompleted === true) return;
    if (!pathname || !WALKTHROUGH_TRIGGER_PAGES.includes(pathname)) return;

    // Delay to let page fully render
    const timer = setTimeout(() => {
      setShowWalkthrough(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, isLoaded, hasCompleted]);

  const saveCompletion = useCallback(async () => {
    // Save to localStorage immediately
    localStorage.setItem(WALKTHROUGH_KEY, "true");
    setHasCompleted(true);

    // Also save to user metadata for persistence across devices
    if (user) {
      try {
        const currentMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        await user.update({
          unsafeMetadata: {
            ...currentMetadata,
            appWalkthroughCompleted: true,
          },
        });
      } catch (error) {
        console.error("Failed to save walkthrough completion:", error);
      }
    }
  }, [user]);

  const handleComplete = useCallback(() => {
    saveCompletion();
    setShowWalkthrough(false);
  }, [saveCompletion]);

  const handleSkip = useCallback(() => {
    saveCompletion();
    setShowWalkthrough(false);
  }, [saveCompletion]);

  const startWalkthrough = useCallback(() => {
    setShowWalkthrough(true);
  }, []);

  const hasCompletedWalkthrough = useCallback(() => {
    return hasCompleted === true;
  }, [hasCompleted]);

  const resetWalkthrough = useCallback(async () => {
    localStorage.removeItem(WALKTHROUGH_KEY);
    setHasCompleted(false);

    if (user) {
      try {
        const currentMetadata = (user.unsafeMetadata as Record<string, any>) || {};
        await user.update({
          unsafeMetadata: {
            ...currentMetadata,
            appWalkthroughCompleted: false,
          },
        });
      } catch (error) {
        console.error("Failed to reset walkthrough:", error);
      }
    }
  }, [user]);

  return (
    <WalkthroughContext.Provider
      value={{
        startWalkthrough,
        hasCompletedWalkthrough,
        resetWalkthrough,
      }}
    >
      {children}
      {showWalkthrough && (
        <InteractiveWalkthrough
          steps={APP_WALKTHROUGH_STEPS}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      )}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return context;
}
