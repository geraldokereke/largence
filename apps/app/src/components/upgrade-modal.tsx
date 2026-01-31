"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Building2, GraduationCap, Crown, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  reason?: string;
  feature?: "document" | "compliance" | "general";
}

const PLANS = [
  {
    id: "FREE",
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out Largence",
    icon: Sparkles,
    features: [
      "5 documents total",
      "10 AI generations/month",
      "5 compliance checks/month",
      "Basic templates",
      "Document export (PDF/DOCX)",
      "Email support",
    ],
    popular: false,
    cta: "Current Plan",
  },
  {
    id: "STUDENT",
    name: "Student",
    price: "$5",
    period: "/month",
    description: "Special pricing for verified students",
    icon: GraduationCap,
    features: [
      "30 documents/month",
      "50 AI generations/month",
      "AI document editing",
      "20 compliance checks/month",
      "5 e-signatures/month",
      "Clause library",
      "Analytics dashboard",
      "2GB storage",
    ],
    popular: false,
    cta: "Apply as Student",
    requiresVerification: true,
  },
  {
    id: "PRO",
    name: "Largence Pro",
    price: "$20",
    period: "/month",
    description: "For professionals and small legal practices",
    icon: Zap,
    features: [
      "100 documents/month",
      "100 AI generations/month",
      "AI-powered compliance fixes",
      "50 compliance checks/month",
      "20 e-signatures/month",
      "5 team members",
      "DocuSign integration",
      "Matter management",
      "Full audit trail",
      "10GB storage",
    ],
    popular: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "MAX",
    name: "Largence Max",
    price: "$100",
    period: "/month",
    description: "For growing teams and legal departments",
    icon: Crown,
    features: [
      "Unlimited documents",
      "500 AI generations/month",
      "Unlimited compliance checks",
      "Unlimited e-signatures",
      "25 team members",
      "API access",
      "Priority support",
      "All integrations",
      "100GB storage",
    ],
    popular: false,
    cta: "Upgrade to Max",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    icon: Building2,
    features: [
      "Everything in Max",
      "Unlimited team members",
      "Unlimited storage",
      "Dedicated account manager",
      "Custom SLA",
      "24/7 priority support",
      "Custom integrations",
      "Onboarding assistance",
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan = "FREE",
  reason,
  feature = "general",
}: UpgradeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "ENTERPRISE") {
      // Redirect to contact sales
      router.push("/account?tab=billing");
      onClose();
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      // Handle student verification requirement
      if (data.requiresVerification) {
        router.push(data.verificationUrl);
        onClose();
        return;
      }

      // Handle enterprise contact
      if (data.requiresContact) {
        window.location.href = data.contactUrl;
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error starting checkout:", error);
    } finally {
      setLoading(null);
    }
  };

  const featureMessage = {
    document: "You've used your document generation limit.",
    compliance: "You've used your compliance check limit.",
    general: "You've reached your plan limits.",
  };

  const isCurrentPlan = (planId: string) => {
    // Handle legacy plan names
    const normalizedCurrent = currentPlan === "STARTER" ? "FREE" : currentPlan;
    return planId === normalizedCurrent;
  };

  const isPlanDowngrade = (planId: string) => {
    const planOrder = ["FREE", "STUDENT", "PRO", "MAX", "ENTERPRISE"];
    const normalizedCurrent = currentPlan === "STARTER" ? "FREE" : currentPlan;
    const currentIndex = planOrder.indexOf(normalizedCurrent);
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex < currentIndex;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            {reason || featureMessage[feature]} Select a plan that fits your needs.
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-2">
            Usage beyond plan limits is billed at: $0.002/1K AI tokens, $0.50/document, $0.25/compliance check
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {PLANS.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const isDowngrade = isPlanDowngrade(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-sm border p-4 flex flex-col ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20"
                    : isCurrent
                    ? "border-green-500 bg-green-500/5"
                    : "border-border"
                }`}
              >
                {plan.popular && !isCurrent && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                    Popular
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs">
                    Current Plan
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-1.5 rounded-sm ${
                      isCurrent ? "bg-green-500/10" : plan.popular ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <plan.icon
                      className={`h-4 w-4 ${
                        isCurrent ? "text-green-600" : plan.popular ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-sm">{plan.name}</h3>
                </div>

                <div className="mb-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {plan.description}
                </p>

                <ul className="space-y-1.5 mb-4 grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null || isCurrent || isDowngrade}
                  variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                  className="w-full rounded-sm text-sm h-9"
                  size="sm"
                >
                  {loading === plan.id 
                    ? "Processing..." 
                    : isCurrent 
                    ? "Current Plan" 
                    : isDowngrade
                    ? "Downgrade"
                    : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground mt-4">
          All paid plans include a 14-day free trial. Cancel anytime.
        </div>
      </DialogContent>
    </Dialog>
  );
}
