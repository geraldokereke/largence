"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Building2, Rocket, X } from "lucide-react";
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
    id: "STARTER",
    name: "Starter",
    price: "$299",
    period: "/month",
    description:
      "Perfect for small teams getting started with contract management",
    icon: Rocket,
    features: [
      "Up to 100 documents/month",
      "100 compliance checks/month",
      "5 team members",
      "5GB storage",
      "AI-powered drafting",
      "Email support",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "$799",
    period: "/month",
    description:
      "For growing teams that need advanced features and unlimited usage",
    icon: Zap,
    features: [
      "Unlimited documents",
      "Unlimited compliance checks",
      "20 team members",
      "50GB storage",
      "AI-powered drafting",
      "Automated compliance",
      "Advanced analytics",
      "Custom templates",
      "Priority support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with complex needs and custom requirements",
    icon: Building2,
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Unlimited storage",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantees",
      "On-premise option",
      "Custom training",
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
    document: "You've used your free document generation.",
    compliance: "You've used your free compliance check.",
    general: "You've reached your plan limits.",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">
            Upgrade to Continue
          </DialogTitle>
          <DialogDescription className="text-base">
            {reason || featureMessage[feature]} Choose a plan to unlock
            unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-sm border p-5 flex flex-col ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-sm ${
                    plan.popular ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <plan.icon
                    className={`h-5 w-5 ${
                      plan.popular ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              <ul className="space-y-2 mb-6 grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null || plan.id === currentPlan}
                variant={plan.popular ? "default" : "outline"}
                className="w-full rounded-sm"
              >
                {loading === plan.id ? "Processing..." : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          All plans include a 14-day free trial. No credit card required to
          start.
        </div>
      </DialogContent>
    </Dialog>
  );
}
