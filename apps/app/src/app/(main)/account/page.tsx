"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Label } from "@largence/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { Skeleton } from "@largence/components/ui/skeleton";
import { Separator } from "@largence/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@largence/components/ui/avatar";
import { Progress } from "@largence/components/ui/progress";
import {
  User,
  Building2,
  Languages,
  Save,
  Loader2,
  CreditCard,
  Check,
  Zap,
  Crown,
  Building,
  ExternalLink,
  AlertCircle,
  FileText,
  ShieldCheck,
  Users,
  HardDrive,
  Sparkles,
  Receipt,
  Plus,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  Download,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "profile" | "organization" | "language" | "billing";

const tabs = [
  { id: "profile" as Tab, name: "Profile", icon: User },
  { id: "organization" as Tab, name: "Organization", icon: Building2 },
  { id: "billing" as Tab, name: "Billing", icon: CreditCard },
  { id: "language" as Tab, name: "Language", icon: Languages },
];

interface BillingData {
  subscription: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    trialEnd: string | null;
    cancelAtPeriodEnd: boolean;
    maxTeamMembers: number;
    maxContracts: number;
    maxStorage: number;
    features: {
      hasAiDrafting: boolean;
      hasComplianceAuto: boolean;
      hasAnalytics: boolean;
      hasCustomTemplates: boolean;
      hasPrioritySupport: boolean;
      hasCustomIntegrations: boolean;
    };
  } | null;
  usage: {
    documentsGenerated: number;
    complianceChecks: number;
    documentsLimit: number;
    complianceLimit: number;
    plan: string;
    status: string;
  };
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  paid: boolean;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const planDetails = {
  FREE: {
    name: "Free",
    price: 0,
    description: "Try Largence with limited features",
    icon: Zap,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  STARTER: {
    name: "Starter",
    price: 299,
    description: "Perfect for small legal teams getting started",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    features: [
      "Up to 5 team members",
      "100 contracts/month",
      "AI contract drafting",
      "Basic templates library",
      "Email support",
      "5 GB storage",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 799,
    description: "For growing legal departments",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    popular: true,
    features: [
      "Up to 20 team members",
      "Unlimited contracts",
      "Advanced AI features",
      "Custom templates",
      "Priority support",
      "50 GB storage",
      "Compliance automation",
      "Analytics & reporting",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: null,
    description: "Tailored for large organizations",
    icon: Building,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    features: [
      "Unlimited team members",
      "Unlimited contracts",
      "Custom AI training",
      "Dedicated account manager",
      "24/7 premium support",
      "Unlimited storage",
      "Advanced security",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
  },
};

export default function AccountPage() {
  const searchParams = useSearchParams();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");

  const isLoaded = userLoaded && orgLoaded;
  const orgMetadata = (organization?.publicMetadata as any) || {};

  // Fetch billing data
  const {
    data: billingData,
    isLoading: billingLoading,
    refetch: refetchBilling,
  } = useQuery<BillingData>({
    queryKey: ["billing"],
    queryFn: async () => {
      const res = await fetch("/api/billing");
      if (!res.ok) throw new Error("Failed to fetch billing");
      return res.json();
    },
    enabled: activeTab === "billing",
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to start checkout. Please try again.");
    },
  });

  // Portal mutation
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create portal session");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to open billing portal. Please try again.");
    },
  });

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<{
    invoices: Invoice[];
    hasMore: boolean;
  }>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/billing/invoices?limit=5");
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
    enabled: activeTab === "billing",
  });

  // Fetch payment methods
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    refetch: refetchPaymentMethods,
  } = useQuery<{
    paymentMethods: PaymentMethod[];
    defaultPaymentMethodId: string | null;
  }>({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await fetch("/api/billing/payment-methods");
      if (!res.ok) throw new Error("Failed to fetch payment methods");
      return res.json();
    },
    enabled: activeTab === "billing" && !!billingData?.subscription,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (immediately: boolean = false) => {
      const res = await fetch(
        `/api/billing/subscription${immediately ? "?immediately=true" : ""}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to cancel subscription");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      refetchBilling();
    },
    onError: () => {
      toast.error("Failed to cancel subscription. Please try again.");
    },
  });

  // Reactivate subscription mutation
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/subscription", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reactivate subscription");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Subscription reactivated successfully!");
      refetchBilling();
    },
    onError: () => {
      toast.error("Failed to reactivate subscription. Please try again.");
    },
  });

  // Retry payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/retry-payment", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to retry payment");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment successful!");
      refetchBilling();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment failed. Please update your payment method.");
    },
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/payment-methods", { method: "POST" });
      if (!res.ok) throw new Error("Failed to add payment method");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to add payment method. Please try again.");
    },
  });

  // Set default payment method mutation
  const setDefaultPaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const res = await fetch("/api/billing/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });
      if (!res.ok) throw new Error("Failed to update payment method");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Default payment method updated!");
      refetchPaymentMethods();
    },
    onError: () => {
      toast.error("Failed to update payment method. Please try again.");
    },
  });

  // Remove payment method mutation
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const res = await fetch(`/api/billing/payment-methods?id=${paymentMethodId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove payment method");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Payment method removed!");
      refetchPaymentMethods();
    },
    onError: () => {
      toast.error("Failed to remove payment method. Please try again.");
    },
  });

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab && tabs.find((t) => t.id === tab)) {
      setActiveTab(tab);
    }

    // Show success/cancel messages
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Your subscription has been activated!");
      refetchBilling();
    } else if (canceled === "true") {
      toast.info("Checkout was canceled.");
    }
  }, [searchParams, refetchBilling]);

  const handleSaveLanguage = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to user preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Language settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-1 flex-col p-4 w-full">
        <div className="mb-4">
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <div className="w-56">
            <Skeleton className="h-8 w-full mb-1" />
            <Skeleton className="h-8 w-full mb-1" />
            <Skeleton className="h-8 w-full mb-1" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold font-display">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, organization, and preferences
        </p>
      </div>

      <div className="flex gap-4">
        {/* Sidebar Navigation */}
        <nav className="w-56 space-y-0.5 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card border rounded-sm p-4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-0.5 font-heading">
                    Profile Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your personal details from your account
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || "User"}
                      />
                      <AvatarFallback className="text-xl">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={user?.firstName || ""}
                            className="h-8 rounded-sm mt-1 bg-muted text-sm"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={user?.lastName || ""}
                            className="h-8 rounded-sm mt-1 bg-muted text-sm"
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          value={user?.primaryEmailAddress?.emailAddress || ""}
                          className="h-8 rounded-sm mt-1 bg-muted text-sm"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-0.5 font-heading">
                    Organization Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Information about your organization
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="shrink-0">
                      {orgMetadata?.logoUrl ? (
                        <Avatar className="h-16 w-16 rounded-sm">
                          <AvatarImage
                            src={orgMetadata.logoUrl}
                            alt={organization?.name || "Organization"}
                          />
                          <AvatarFallback className="rounded-sm">
                            <Building2 className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-16 w-16 rounded-sm bg-primary/10 flex items-center justify-center border">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label>Organization Name</Label>
                      <Input
                        value={organization?.name || ""}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Industry</Label>
                      <Input
                        value={orgMetadata?.industry || "Not specified"}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Input
                        value={orgMetadata?.companySize || "Not specified"}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Country</Label>
                      <Input
                        value={orgMetadata?.country || "Not specified"}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Team Size</Label>
                      <Input
                        value={orgMetadata?.teamSize || "Not specified"}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  </div>

                  {orgMetadata?.website && (
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={orgMetadata.website}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  )}

                  {orgMetadata?.billingEmail && (
                    <div>
                      <Label>Billing Email</Label>
                      <Input
                        value={orgMetadata.billingEmail}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  )}

                  {orgMetadata?.onboardedAt && (
                    <div>
                      <Label>Member Since</Label>
                      <Input
                        value={new Date(orgMetadata.onboardedAt).toLocaleString(
                          "en-US",
                          {
                            dateStyle: "long",
                            timeStyle: "short",
                          },
                        )}
                        className="h-8 rounded-sm mt-1 bg-muted text-sm"
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-0.5 font-heading">
                    Billing & Subscription
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription plan and billing details
                  </p>
                </div>

                <Separator />

                {billingLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Current Plan Card */}
                    <div className="border rounded-sm p-4 bg-linear-to-br from-primary/5 to-transparent">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const plan =
                              billingData?.subscription?.plan ||
                              billingData?.usage?.plan ||
                              "FREE";
                            const details =
                              planDetails[plan as keyof typeof planDetails] ||
                              planDetails.FREE;
                            const Icon = details.icon;
                            return (
                              <>
                                <div
                                  className={`p-2 rounded-sm ${details.bgColor}`}
                                >
                                  <Icon
                                    className={`h-5 w-5 ${details.color}`}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold font-heading">
                                    {details.name} Plan
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {details.description}
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        {billingData?.subscription?.status && (
                          <span
                            className={`px-2 py-1 rounded-sm text-xs font-medium ${
                              billingData.subscription.status === "ACTIVE" ||
                              billingData.subscription.status === "TRIALING"
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            }`}
                          >
                            {billingData.subscription.status === "TRIALING"
                              ? "Trial"
                              : billingData.subscription.status}
                          </span>
                        )}
                      </div>

                      {/* Usage Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-background/50 rounded-sm border">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Documents
                            </span>
                          </div>
                          <div className="text-2xl font-semibold">
                            {billingData?.usage?.documentsGenerated || 0}
                            <span className="text-sm font-normal text-muted-foreground">
                              /
                              {billingData?.usage?.documentsLimit === -1
                                ? "∞"
                                : billingData?.usage?.documentsLimit || 2}
                            </span>
                          </div>
                          <Progress
                            value={
                              billingData?.usage?.documentsLimit === -1
                                ? 0
                                : ((billingData?.usage?.documentsGenerated ||
                                    0) /
                                    (billingData?.usage?.documentsLimit || 2)) *
                                  100
                            }
                            className="h-1.5 mt-2"
                          />
                        </div>
                        <div className="p-3 bg-background/50 rounded-sm border">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Compliance Checks
                            </span>
                          </div>
                          <div className="text-2xl font-semibold">
                            {billingData?.usage?.complianceChecks || 0}
                            <span className="text-sm font-normal text-muted-foreground">
                              /
                              {billingData?.usage?.complianceLimit === -1
                                ? "∞"
                                : billingData?.usage?.complianceLimit || 2}
                            </span>
                          </div>
                          <Progress
                            value={
                              billingData?.usage?.complianceLimit === -1
                                ? 0
                                : ((billingData?.usage?.complianceChecks || 0) /
                                    (billingData?.usage?.complianceLimit ||
                                      2)) *
                                  100
                            }
                            className="h-1.5 mt-2"
                          />
                        </div>
                      </div>

                      {/* Billing Info */}
                      {billingData?.subscription?.currentPeriodEnd && (
                        <div className="text-sm text-muted-foreground">
                          {billingData.subscription.cancelAtPeriodEnd ? (
                            <span className="text-amber-600">
                              Your plan will be canceled on{" "}
                              {new Date(
                                billingData.subscription.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>
                              Next billing date:{" "}
                              {new Date(
                                billingData.subscription.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {billingData?.subscription?.trialEnd &&
                        billingData.subscription.status === "TRIALING" && (
                          <div className="text-sm text-blue-600 mt-1">
                            Trial ends:{" "}
                            {new Date(
                              billingData.subscription.trialEnd,
                            ).toLocaleDateString()}
                          </div>
                        )}

                      {/* Manage Subscription Button */}
                      {billingData?.subscription?.plan &&
                        billingData.subscription.plan !== "FREE" && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              variant="outline"
                              className="rounded-sm"
                              onClick={() => portalMutation.mutate()}
                              disabled={portalMutation.isPending}
                            >
                              {portalMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ExternalLink className="h-4 w-4 mr-2" />
                              )}
                              Manage Subscription
                            </Button>
                            
                            {billingData.subscription.cancelAtPeriodEnd ? (
                              <Button
                                variant="outline"
                                className="rounded-sm"
                                onClick={() => reactivateMutation.mutate()}
                                disabled={reactivateMutation.isPending}
                              >
                                {reactivateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Play className="h-4 w-4 mr-2" />
                                )}
                                Reactivate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="rounded-sm text-destructive hover:text-destructive"
                                onClick={() => cancelMutation.mutate(false)}
                                disabled={cancelMutation.isPending}
                              >
                                {cancelMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Cancel Plan
                              </Button>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Past Due Warning */}
                    {billingData?.subscription?.status === "PAST_DUE" && (
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-700">
                            Payment Failed
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Your last payment failed. Please update your payment method or retry the payment to avoid service interruption.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 rounded-sm"
                            onClick={() => retryPaymentMutation.mutate()}
                            disabled={retryPaymentMutation.isPending}
                          >
                            {retryPaymentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Retry Payment
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Payment Methods Section */}
                    {billingData?.subscription?.plan &&
                      billingData.subscription.plan !== "FREE" && (
                        <div className="border rounded-sm p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold font-heading">
                              Payment Methods
                            </h3>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-sm"
                              onClick={() => addPaymentMethodMutation.mutate()}
                              disabled={addPaymentMethodMutation.isPending}
                            >
                              {addPaymentMethodMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Plus className="h-4 w-4 mr-2" />
                              )}
                              Add Card
                            </Button>
                          </div>
                          
                          {paymentMethodsLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-16 w-full" />
                            </div>
                          ) : paymentMethodsData?.paymentMethods?.length ? (
                            <div className="space-y-2">
                              {paymentMethodsData.paymentMethods.map((pm) => (
                                <div
                                  key={pm.id}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-sm border"
                                >
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium capitalize">
                                        {pm.brand} •••• {pm.last4}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Expires {pm.expMonth}/{pm.expYear}
                                      </p>
                                    </div>
                                    {pm.isDefault && (
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-sm">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!pm.isDefault && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 rounded-sm"
                                        onClick={() =>
                                          setDefaultPaymentMethodMutation.mutate(pm.id)
                                        }
                                        disabled={setDefaultPaymentMethodMutation.isPending}
                                      >
                                        Set Default
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 rounded-sm text-destructive hover:text-destructive"
                                      onClick={() =>
                                        removePaymentMethodMutation.mutate(pm.id)
                                      }
                                      disabled={removePaymentMethodMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No payment methods on file.
                            </p>
                          )}
                        </div>
                      )}

                    {/* Invoice History Section */}
                    {billingData?.subscription?.plan &&
                      billingData.subscription.plan !== "FREE" && (
                        <div className="border rounded-sm p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold font-heading">
                              Invoice History
                            </h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-sm"
                              onClick={() => portalMutation.mutate()}
                            >
                              View All
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                          </div>
                          
                          {invoicesLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          ) : invoicesData?.invoices?.length ? (
                            <div className="space-y-2">
                              {invoicesData.invoices.map((invoice) => (
                                <div
                                  key={invoice.id}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-sm border"
                                >
                                  <div className="flex items-center gap-3">
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">
                                        {invoice.number || "Invoice"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(invoice.created * 1000).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="font-medium">
                                        ${(invoice.amountPaid / 100).toFixed(2)}
                                      </p>
                                      <span
                                        className={`text-xs ${
                                          invoice.paid
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                        }`}
                                      >
                                        {invoice.paid ? "Paid" : invoice.status}
                                      </span>
                                    </div>
                                    {invoice.invoicePdf && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 rounded-sm"
                                        onClick={() =>
                                          window.open(invoice.invoicePdf!, "_blank")
                                        }
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No invoices yet.
                            </p>
                          )}
                        </div>
                      )}

                    {/* Free Tier Warning */}
                    {(!billingData?.subscription?.plan ||
                      billingData.subscription.plan === "FREE") &&
                      (billingData?.usage?.documentsGenerated || 0) >=
                        (billingData?.usage?.documentsLimit || 2) && (
                        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-700">
                              You've reached your free limit
                            </p>
                            <p className="text-sm text-amber-600 mt-1">
                              Upgrade to a paid plan to continue generating
                              documents and running compliance checks.
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Pricing Plans */}
                    <div>
                      <h3 className="font-semibold mb-4 font-heading">
                        Available Plans
                      </h3>
                      <div className="grid gap-4">
                        {/* Starter Plan */}
                        <div
                          className={`border rounded-sm p-5 transition-all ${
                            billingData?.subscription?.plan === "STARTER"
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-sm ${planDetails.STARTER.bgColor}`}
                              >
                                <Zap
                                  className={`h-5 w-5 ${planDetails.STARTER.color}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold font-heading">
                                  Starter
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Perfect for small legal teams
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                $299
                                <span className="text-sm font-normal text-muted-foreground">
                                  /mo
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            {planDetails.STARTER.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="w-full mt-4 rounded-sm"
                            variant={
                              billingData?.subscription?.plan === "STARTER"
                                ? "outline"
                                : "default"
                            }
                            disabled={
                              billingData?.subscription?.plan === "STARTER" ||
                              checkoutMutation.isPending
                            }
                            onClick={() => checkoutMutation.mutate("STARTER")}
                          >
                            {checkoutMutation.isPending &&
                            checkoutMutation.variables === "STARTER" ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {billingData?.subscription?.plan === "STARTER"
                              ? "Current Plan"
                              : "Start Free Trial"}
                          </Button>
                        </div>

                        {/* Professional Plan */}
                        <div
                          className={`border rounded-sm p-5 relative transition-all ${
                            billingData?.subscription?.plan === "PROFESSIONAL"
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm">
                            Most Popular
                          </div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-sm ${planDetails.PROFESSIONAL.bgColor}`}
                              >
                                <Crown
                                  className={`h-5 w-5 ${planDetails.PROFESSIONAL.color}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold font-heading">
                                  Professional
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  For growing legal departments
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                $799
                                <span className="text-sm font-normal text-muted-foreground">
                                  /mo
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            {planDetails.PROFESSIONAL.features.map(
                              (feature, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4 text-emerald-600" />
                                  <span>{feature}</span>
                                </div>
                              ),
                            )}
                          </div>
                          <Button
                            className="w-full mt-4 rounded-sm"
                            variant={
                              billingData?.subscription?.plan === "PROFESSIONAL"
                                ? "outline"
                                : "default"
                            }
                            disabled={
                              billingData?.subscription?.plan ===
                                "PROFESSIONAL" || checkoutMutation.isPending
                            }
                            onClick={() =>
                              checkoutMutation.mutate("PROFESSIONAL")
                            }
                          >
                            {checkoutMutation.isPending &&
                            checkoutMutation.variables === "PROFESSIONAL" ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {billingData?.subscription?.plan === "PROFESSIONAL"
                              ? "Current Plan"
                              : "Start Free Trial"}
                          </Button>
                        </div>

                        {/* Enterprise Plan */}
                        <div
                          className={`border rounded-sm p-5 transition-all ${
                            billingData?.subscription?.plan === "ENTERPRISE"
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-sm ${planDetails.ENTERPRISE.bgColor}`}
                              >
                                <Building
                                  className={`h-5 w-5 ${planDetails.ENTERPRISE.color}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold font-heading">
                                  Enterprise
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Tailored for large organizations
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">Custom</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            {planDetails.ENTERPRISE.features.map(
                              (feature, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4 text-emerald-600" />
                                  <span>{feature}</span>
                                </div>
                              ),
                            )}
                          </div>
                          <Button
                            className="w-full mt-4 rounded-sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                "mailto:sales@largence.com?subject=Enterprise%20Plan%20Inquiry",
                                "_blank",
                              )
                            }
                          >
                            Contact Sales
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1 font-heading">
                    Language
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language for the interface
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="language">Interface Language</Label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English (US)">
                          English (US)
                        </SelectItem>
                        <SelectItem value="English (UK)">
                          English (UK)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently, only English variants are available. More
                      languages coming soon.
                    </p>
                  </div>

                  <div className="bg-muted/30 border rounded-sm p-4">
                    <p className="text-sm text-muted-foreground">
                      Language settings will be applied automatically across the
                      application.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveLanguage}
                    disabled={isSaving}
                    className="h-8 rounded-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
