"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Building2, Rocket, X, GraduationCap, Crown } from "lucide-react";
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
    id: "STUDENT",
    name: "Student",
    price: "$5",
    period: "/month",
    description: "Special pricing for verified students",
    icon: GraduationCap,
    features: [
      "30 documents/month",
      "50 AI generations/month",
      "200K AI tokens/month",
      "20 compliance checks/month",
      "5 e-signatures/month",
      "2GB storage",
      "Student verification required",
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
      "500K AI tokens/month",
      "50 compliance checks/month",
      "20 e-signatures/month",
      "5 team members",
      "10GB storage",
      "Automated compliance",
      "DocuSign integration",
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
      "2M AI tokens/month",
      "Unlimited compliance",
      "Unlimited e-signatures",
      "25 team members",
      "100GB storage",
      "API access",
      "Priority support",
    ],
    popular: false,
    cta: "Upgrade to Max",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with custom requirements",
    icon: Building2,
    features: [
      "Everything in Max",
      "Unlimited team members",
      "Unlimited storage",
      "SSO (Single Sign-On)",
      "White-label option",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantees",
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
    document: "You've used your free document generation.",
    compliance: "You've used your free compliance check.",
    general: "You've reached your plan limits.",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">
            Upgrade to Continue
          </DialogTitle>
          <DialogDescription className="text-base">
            {reason || featureMessage[feature]} Choose a plan to unlock
            unlimited access.
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Usage beyond plan limits is billed at: $0.002/1K AI tokens • $0.50/document • $0.25/compliance check
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
