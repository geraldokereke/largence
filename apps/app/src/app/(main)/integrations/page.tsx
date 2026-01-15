"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import {
  Search,
  CheckCircle2,
  Settings,
  Trash2,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  Bell,
  Sparkles,
  BellRing,
  Link2,
  ArrowRight,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  SiNotion,
  SiGoogledrive,
  SiDropbox,
  SiSlack,
  SiGooglesheets,
  SiTrello,
  SiAsana,
  SiZapier,
  SiAirtable,
  SiSalesforce,
  SiHubspot,
} from "react-icons/si";
import { FaMicrosoft, FaFileSignature } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Only show these integrations (Notion is functional, others coming soon)
const AVAILABLE_PROVIDERS = ["NOTION", "GOOGLE_DRIVE", "DROPBOX", "DOCUSIGN"];
const OAUTH_ENABLED_PROVIDERS = ["NOTION", "DROPBOX", "DOCUSIGN"];

// UI catalog for provider names
const INTEGRATION_CATALOG_UI: Record<string, { name: string }> = {
  NOTION: { name: "Notion" },
  GOOGLE_DRIVE: { name: "Google Drive" },
  DROPBOX: { name: "Dropbox" },
  DOCUSIGN: { name: "DocuSign" },
};

// Icon mapping for integration providers
const PROVIDER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  NOTION: SiNotion,
  GOOGLE_DRIVE: SiGoogledrive,
  DROPBOX: SiDropbox,
  SLACK: SiSlack,
  MICROSOFT_365: FaMicrosoft,
  DOCUSIGN: FaFileSignature,
  GOOGLE_SHEETS: SiGooglesheets,
  SALESFORCE: SiSalesforce,
  TRELLO: SiTrello,
  ASANA: SiAsana,
  ZAPIER: SiZapier,
  AIRTABLE: SiAirtable,
  HUBSPOT: SiHubspot,
};

const PROVIDER_COLORS: Record<string, { text: string; bg: string }> = {
  NOTION: {
    text: "text-black dark:text-white",
    bg: "bg-black/5 dark:bg-white/10",
  },
  GOOGLE_DRIVE: { text: "text-[#4285F4]", bg: "bg-blue-500/10" },
  DROPBOX: { text: "text-[#0061FF]", bg: "bg-blue-600/10" },
  SLACK: { text: "text-[#4A154B]", bg: "bg-purple-900/10" },
  MICROSOFT_365: { text: "text-[#00A4EF]", bg: "bg-blue-500/10" },
  DOCUSIGN: { text: "text-[#FF3B2F]", bg: "bg-red-500/10" },
  GOOGLE_SHEETS: { text: "text-[#34A853]", bg: "bg-green-500/10" },
  SALESFORCE: { text: "text-[#00A1E0]", bg: "bg-blue-400/10" },
  TRELLO: { text: "text-[#0079BF]", bg: "bg-blue-600/10" },
  ASANA: { text: "text-[#F06A6A]", bg: "bg-red-400/10" },
  ZAPIER: { text: "text-[#FF4A00]", bg: "bg-orange-500/10" },
  AIRTABLE: { text: "text-[#18BFFF]", bg: "bg-blue-400/10" },
  HUBSPOT: { text: "text-[#FF7A59]", bg: "bg-orange-400/10" },
};

// Usage instructions for each integration
const INTEGRATION_USAGE: Record<string, { title: string; steps: string[] }> = {
  NOTION: {
    title: "Export documents to Notion",
    steps: [
      "Go to Documents → click menu (...) on any document",
      "Select 'Export to Cloud' → choose Notion",
      "Document will be created as a Notion page",
    ],
  },
  DROPBOX: {
    title: "Backup documents to Dropbox",
    steps: [
      "Go to Documents → click menu (...) on any document",
      "Select 'Export to Cloud' → choose Dropbox",
      "Document will be saved to /Largence folder",
    ],
  },
  DOCUSIGN: {
    title: "Send documents for signature",
    steps: [
      "Open any document in the editor",
      "Click 'Save' dropdown → 'Request Signature'",
      "Select recipients and send via DocuSign",
    ],
  },
  GOOGLE_DRIVE: {
    title: "Sync with Google Drive",
    steps: [
      "Go to Documents → click menu (...) on any document",
      "Select 'Export to Cloud' → choose Google Drive",
      "Document will be synced to your Drive",
    ],
  },
};

interface Integration {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  status: string;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  syncedItemsCount: number;
  externalEmail: string | null;
  syncEnabled: boolean;
  settings: Record<string, unknown> | null;
  oauthSupported?: boolean;
}

interface IntegrationsResponse {
  integrations: Integration[];
  categories: { id: string; name: string; count: number }[];
  stats: {
    connectedCount: number;
    totalSyncedItems: number;
    lastSyncTime: string | null;
    availableCount: number;
  };
}

async function fetchIntegrations(): Promise<IntegrationsResponse> {
  const res = await fetch("/api/integrations");
  if (!res.ok) throw new Error("Failed to fetch integrations");
  return res.json();
}

interface ConnectResponse {
  success: boolean;
  requiresOAuth?: boolean;
  authUrl?: string;
  comingSoon?: boolean;
  message?: string;
  error?: string;
}

async function connectIntegration(
  provider: string,
): Promise<ConnectResponse> {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to connect integration");
  return data;
}

async function disconnectIntegration(
  id: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`/api/integrations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to disconnect integration");
  return res.json();
}

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null,
  );
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [integrationToDisconnect, setIntegrationToDisconnect] =
    useState<Integration | null>(null);

  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const [comingSoonIntegration, setComingSoonIntegration] = useState<string | null>(null);
  const [notifiedIntegrations, setNotifiedIntegrations] = useState<Set<string>>(new Set());
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedUsageProvider, setSelectedUsageProvider] = useState<string | null>(null);

  // Track if OAuth toast has been shown to prevent duplicates
  const oauthToastShown = useRef(false);

  // Handle OAuth callback success/error messages
  useEffect(() => {
    // Prevent double toast in StrictMode
    if (oauthToastShown.current) return;
    
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "google_drive_connected") {
      oauthToastShown.current = true;
      toast.success("Google Drive connected!", {
        description: "Your Google Drive account has been successfully linked.",
      });
      window.history.replaceState({}, "", "/integrations");
    } else if (success === "notion_connected") {
      oauthToastShown.current = true;
      toast.success("Notion connected!", {
        description: "Your Notion workspace has been successfully linked.",
      });
      window.history.replaceState({}, "", "/integrations");
    } else if (success === "dropbox_connected") {
      oauthToastShown.current = true;
      toast.success("Dropbox connected!", {
        description: "Your Dropbox account has been successfully linked.",
      });
      window.history.replaceState({}, "", "/integrations");
    } else if (success === "docusign_connected") {
      oauthToastShown.current = true;
      toast.success("DocuSign connected!", {
        description: "Your DocuSign account has been successfully linked.",
      });
      window.history.replaceState({}, "", "/integrations");
    }

    if (error) {
      oauthToastShown.current = true;
      const errorMessages: Record<string, string> = {
        oauth_denied: "Authorization was denied. Please try again.",
        missing_params: "Missing required parameters. Please try again.",
        invalid_state: "Invalid request state. Please try again.",
        token_exchange_failed: "Failed to complete authorization. Please try again.",
        callback_failed: "An error occurred during connection. Please try again.",
      };
      toast.error("Connection failed", {
        description: errorMessages[error] || "An unknown error occurred.",
      });
      window.history.replaceState({}, "", "/integrations");
    }
  }, [searchParams]);

  const handleNotifyMe = (provider: string, integrationName: string) => {
    setNotifiedIntegrations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
        toast.success("Notification removed", {
          description: `You won't be notified when ${integrationName} launches`,
        });
      } else {
        newSet.add(provider);
        toast.success("You'll be notified!", {
          description: `We'll let you know when ${integrationName} is available`,
        });
      }
      return newSet;
    });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["integrations"],
    queryFn: fetchIntegrations,
  });

  const connectMutation = useMutation({
    mutationFn: connectIntegration,
    onSuccess: (data, provider) => {
      // Handle OAuth redirect
      if (data.requiresOAuth && data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
        return;
      }
      
      // Handle coming soon
      if (data.comingSoon) {
        setConnectingProvider(null);
        setComingSoonIntegration(
          INTEGRATION_CATALOG_UI[provider]?.name || provider.replace(/_/g, " ")
        );
        setShowComingSoonDialog(true);
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setConnectingProvider(null);
      toast.success("Integration connected", {
        description: `Successfully connected to ${provider.replace(/_/g, " ").toLowerCase()}`,
      });
    },
    onError: (error: Error, provider) => {
      setConnectingProvider(null);
      toast.error("Connection failed", {
        description: error.message || `Failed to connect to ${provider.replace(/_/g, " ").toLowerCase()}`,
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowDisconnectDialog(false);
      toast.success("Integration disconnected", {
        description: `${integrationToDisconnect?.name} has been disconnected`,
      });
      setIntegrationToDisconnect(null);
    },
    onError: () => {
      toast.error("Disconnection failed", {
        description: "Please try again later",
      });
    },
  });

  // Get only available integrations (the ones we're showing as "coming soon")
  const availableIntegrations = useMemo(() => {
    if (!data?.integrations) return [];
    return data.integrations.filter((integration) =>
      AVAILABLE_PROVIDERS.includes(integration.provider)
    );
  }, [data?.integrations]);

  // Calculate accurate category counts based on available integrations only
  const calculatedCategories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    
    // Add "all" category
    categoryMap.set("all", { id: "all", name: "All", count: availableIntegrations.length });
    
    // Count integrations per category
    availableIntegrations.forEach((integration) => {
      const categoryId = integration.category.toLowerCase().replace(/\s+/g, "-");
      const existing = categoryMap.get(categoryId);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: integration.category,
          count: 1,
        });
      }
    });
    
    // Add "connected" category
    const connectedCount = availableIntegrations.filter(i => i.status === "CONNECTED").length;
    categoryMap.set("connected", { id: "connected", name: "Connected", count: connectedCount });
    
    return Array.from(categoryMap.values());
  }, [availableIntegrations]);

  const filteredIntegrations = useMemo(() => {
    if (!availableIntegrations.length) return [];

    return availableIntegrations.filter((integration) => {
      // Category filter
      if (activeCategory !== "all") {
        if (activeCategory === "connected") {
          if (integration.status !== "CONNECTED") return false;
        } else {
          const categoryId = integration.category.toLowerCase().replace(/\s+/g, "-");
          if (categoryId !== activeCategory) return false;
        }
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          integration.name.toLowerCase().includes(searchLower) ||
          integration.description.toLowerCase().includes(searchLower) ||
          integration.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [availableIntegrations, activeCategory, search]);

  const handleConnect = (provider: string, integrationName: string) => {
    // For OAuth-enabled providers, initiate OAuth flow
    if (OAUTH_ENABLED_PROVIDERS.includes(provider)) {
      setConnectingProvider(provider);
      connectMutation.mutate(provider);
      return;
    }
    
    // Show coming soon dialog for others
    setComingSoonIntegration(integrationName);
    setShowComingSoonDialog(true);
  };

  const handleDisconnectClick = (integration: Integration) => {
    setIntegrationToDisconnect(integration);
    setShowDisconnectDialog(true);
  };

  const handleDisconnectConfirm = () => {
    if (integrationToDisconnect) {
      disconnectMutation.mutate(integrationToDisconnect.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-4">
          <div className="h-7 w-48 bg-muted animate-pulse rounded-sm mb-1" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded-sm" />
        </div>
        <div className="flex gap-2 mb-4">
          <div className="h-8 flex-1 bg-muted animate-pulse rounded-sm" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-3">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-base font-semibold mb-1">
          Failed to load integrations
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your integrations.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Info Banner */}
      <div className="mb-4 p-3 rounded-sm border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-sm bg-blue-100 dark:bg-blue-900/30">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold font-heading text-blue-800 dark:text-blue-300">
              Connect Your Tools
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">
              Google Drive and Notion integrations are now available! Connect your accounts to sync documents seamlessly.
              More integrations coming soon - click &quot;Notify Me&quot; to be alerted when they launch.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold font-display">
              Integrations
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect Largence with your favorite tools and automate your legal
              workflows
            </p>
          </div>
          {stats && stats.connectedCount > 0 && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border bg-emerald-500/10 border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {stats.connectedCount} Connected
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50">
                <span className="text-sm font-medium">
                  {stats.totalSyncedItems.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  items synced
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="h-8 rounded-sm pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-8 rounded-sm text-sm"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {calculatedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors text-sm ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            }`}
          >
            <span className="text-sm font-medium">{category.name}</span>
            <span className="ml-2 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredIntegrations.map((integration) => {
          const Icon = PROVIDER_ICONS[integration.provider] || Zap;
          const colors = PROVIDER_COLORS[integration.provider] || {
            text: "text-primary",
            bg: "bg-primary/10",
          };
          const isConnected = integration.status === "CONNECTED";
          const isConnecting = connectingProvider === integration.provider;

          return (
            <div
              key={integration.id}
              className="group flex flex-col rounded-lg border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all h-[200px]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {integration.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    ) : OAUTH_ENABLED_PROVIDERS.includes(integration.provider) ? (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">Available</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">Coming Soon</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground mb-auto line-clamp-2 leading-relaxed">
                {integration.description}
              </p>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t flex gap-2">
                {isConnected ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 h-8 rounded-md text-xs"
                      onClick={() => {
                        setSelectedUsageProvider(integration.provider);
                        setShowUsageDialog(true);
                      }}
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                      How to Use
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-md p-0"
                      onClick={() => handleDisconnectClick(integration)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : OAUTH_ENABLED_PROVIDERS.includes(integration.provider) ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full h-8 rounded-md text-xs"
                    onClick={() => handleConnect(integration.provider, integration.name)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3.5 w-3.5 mr-1.5" />
                        Connect
                      </>
                    )}
                  </Button>
                ) : notifiedIntegrations.has(integration.provider) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full h-8 rounded-md text-xs"
                    onClick={() => handleNotifyMe(integration.provider, integration.name)}
                  >
                    <BellRing className="h-3.5 w-3.5 mr-1.5" />
                    Subscribed
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 rounded-md text-xs"
                    onClick={() => handleNotifyMe(integration.provider, integration.name)}
                  >
                    <Bell className="h-3.5 w-3.5 mr-1.5" />
                    Notify Me
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {search
              ? `No integrations match "${search}". Try a different search term.`
              : "No integrations available in this category."}
          </p>
          {search && (
            <Button
              variant="outline"
              className="mt-4 rounded-sm"
              onClick={() => setSearch("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Disconnect Dialog - kept for future use */}
      <Dialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <DialogContent className="rounded-sm sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {integrationToDisconnect?.name}? 
              This will stop syncing and remove access to this integration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectConfirm}
              disabled={disconnectMutation.isPending}
              className="rounded-sm"
            >
              Disconnect
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <Trash2 className="h-4 w-4 ml-2" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Instructions Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="rounded-sm sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUsageProvider && PROVIDER_ICONS[selectedUsageProvider] && (
                (() => {
                  const Icon = PROVIDER_ICONS[selectedUsageProvider];
                  const colors = PROVIDER_COLORS[selectedUsageProvider] || { text: "text-primary", bg: "bg-primary/10" };
                  return (
                    <div className={`p-1.5 rounded-sm ${colors.bg}`}>
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                    </div>
                  );
                })()
              )}
              How to use {selectedUsageProvider && INTEGRATION_CATALOG_UI[selectedUsageProvider]?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedUsageProvider && INTEGRATION_USAGE[selectedUsageProvider]?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {selectedUsageProvider && INTEGRATION_USAGE[selectedUsageProvider]?.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {idx + 1}
                </span>
                <p className="text-sm text-foreground pt-0.5">{step}</p>
              </div>
            ))}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUsageDialog(false)}
              className="rounded-sm"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowUsageDialog(false);
                window.location.href = "/documents";
              }}
              className="rounded-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Go to Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
