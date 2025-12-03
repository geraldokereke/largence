"use client";

import { useState, useCallback } from "react";

interface UpgradeState {
  isOpen: boolean;
  reason?: string;
  feature?: "document" | "compliance" | "general";
  currentPlan?: string;
}

export function useUpgradeModal() {
  const [state, setState] = useState<UpgradeState>({
    isOpen: false,
  });

  const openUpgradeModal = useCallback(
    (options?: {
      reason?: string;
      feature?: "document" | "compliance" | "general";
      currentPlan?: string;
    }) => {
      setState({
        isOpen: true,
        reason: options?.reason,
        feature: options?.feature,
        currentPlan: options?.currentPlan,
      });
    },
    [],
  );

  const closeUpgradeModal = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  return {
    ...state,
    openUpgradeModal,
    closeUpgradeModal,
  };
}

// Helper to check API response for upgrade required
export function requiresUpgrade(response: any): boolean {
  return response?.requiresUpgrade === true || response?.status === 402;
}

// Helper to extract upgrade info from API error response
export function getUpgradeInfo(error: any): {
  reason?: string;
  currentPlan?: string;
} {
  return {
    reason: error?.error || error?.message,
    currentPlan: error?.currentPlan,
  };
}
