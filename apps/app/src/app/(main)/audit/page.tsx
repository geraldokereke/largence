"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Skeleton } from "@largence/components/ui/skeleton";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  FileText,
  TrendingUp,
  Edit,
  Check,
  UserPlus,
  Eye,
  Activity,
  Users,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Bot,
  Archive,
  Trash2,
  LogIn,
  LogOut,
  Share2,
  PenTool,
  XCircle,
  Settings,
  RefreshCw,
  History,
  Loader2,
  Sparkles,
  Link,
  Unlink,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  userId: string | null;
  organizationId: string;
  action: string;
  actionLabel: string;
  entityType: string;
  entityId: string | null;
  entityName: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  device: string | null;
  userName: string | null;
  userAvatar: string | null;
  userType: string;
  createdAt: string;
}

interface AuditResponse {
  auditLogs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  eventCounts: {
    all: number;
    document: number;
    approval: number;
    compliance: number;
    user: number;
    system: number;
    integration: number;
  };
  stats: {
    eventsThisWeek: number;
    activeUsers: number;
    documentsModified: number;
    documentsModifiedToday: number;
    complianceChecks: number;
    lastComplianceCheck: string | null;
  };
}

const getActionIcon = (action: string) => {
  switch (action) {
    // Document actions
    case "DOCUMENT_CREATED":
      return { icon: FileText, color: "text-primary bg-primary/10" };
    case "DOCUMENT_UPDATED":
      return { icon: Edit, color: "text-amber-600 bg-amber-500/10" };
    case "DOCUMENT_DELETED":
      return { icon: Trash2, color: "text-red-600 bg-red-500/10" };
    case "DOCUMENT_VIEWED":
      return { icon: Eye, color: "text-slate-600 bg-slate-500/10" };
    case "DOCUMENT_EXPORTED":
      return { icon: Download, color: "text-blue-600 bg-blue-500/10" };
    case "DOCUMENT_SHARED":
      return { icon: Share2, color: "text-purple-600 bg-purple-500/10" };
    case "DOCUMENT_SIGNED":
      return { icon: PenTool, color: "text-emerald-600 bg-emerald-500/10" };
    case "DOCUMENT_APPROVED":
      return { icon: Check, color: "text-emerald-600 bg-emerald-500/10" };
    case "DOCUMENT_REJECTED":
      return { icon: XCircle, color: "text-red-600 bg-red-500/10" };
    // Compliance actions
    case "COMPLIANCE_CHECK_RUN":
    case "COMPLIANCE_CHECK_COMPLETED":
      return { icon: ShieldCheck, color: "text-blue-600 bg-blue-500/10" };
    case "AGENTIC_COMPLIANCE_RUN":
    case "AGENTIC_COMPLIANCE_COMPLETED":
      return { icon: Sparkles, color: "text-purple-600 bg-purple-500/10" };
    // User actions
    case "USER_INVITED":
      return { icon: UserPlus, color: "text-emerald-600 bg-emerald-500/10" };
    case "USER_REMOVED":
      return { icon: Trash2, color: "text-red-600 bg-red-500/10" };
    case "USER_ROLE_CHANGED":
      return { icon: Settings, color: "text-amber-600 bg-amber-500/10" };
    case "USER_LOGIN":
      return { icon: LogIn, color: "text-emerald-600 bg-emerald-500/10" };
    case "USER_LOGOUT":
      return { icon: LogOut, color: "text-slate-600 bg-slate-500/10" };
    // System actions
    case "SYSTEM_BACKUP":
      return { icon: Archive, color: "text-slate-600 bg-slate-500/10" };
    case "SYSTEM_RESTORE":
      return { icon: Archive, color: "text-blue-600 bg-blue-500/10" };
    case "SETTINGS_CHANGED":
      return { icon: Settings, color: "text-amber-600 bg-amber-500/10" };
    // Integration actions
    case "INTEGRATION_CONNECTED":
      return { icon: Link, color: "text-emerald-600 bg-emerald-500/10" };
    case "INTEGRATION_DISCONNECTED":
      return { icon: Unlink, color: "text-red-600 bg-red-500/10" };
    case "INTEGRATION_SYNCED":
      return { icon: RefreshCcw, color: "text-blue-600 bg-blue-500/10" };
    case "INTEGRATION_ERROR":
      return { icon: AlertTriangle, color: "text-red-600 bg-red-500/10" };
    default:
      return { icon: Activity, color: "text-primary bg-primary/10" };
  }
};

const getDeviceIcon = (device: string | null) => {
  if (!device || device === "System") return Bot;
  if (device.includes("Mobile") || device.includes("Tablet")) return Smartphone;
  return Monitor;
};

const formatTimestamp = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Backfill historical data mutation
  const backfillMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/audit/backfill", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync historical data");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      if (data.backfilled?.documents > 0 || data.backfilled?.complianceChecks > 0) {
        setBackfillMessage(
          `Synced ${data.backfilled.documents} documents and ${data.backfilled.complianceChecks} compliance checks`
        );
      } else {
        setBackfillMessage("All historical data already synced");
      }
      setTimeout(() => setBackfillMessage(null), 5000);
    },
  });

  const { data, isLoading, refetch } = useQuery<AuditResponse>({
    queryKey: ["audit-logs", page, eventType, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        eventType,
        search: debouncedSearch,
      });
      const response = await fetch(`/api/audit?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });

  const stats = [
    {
      label: "Events This Week",
      value: data?.stats.eventsThisWeek.toLocaleString() || "0",
      change: `${data?.stats.documentsModifiedToday || 0} today`,
      icon: Activity,
    },
    {
      label: "Active Users",
      value: data?.stats.activeUsers.toString() || "0",
      change: "This week",
      icon: Users,
    },
    {
      label: "Documents Modified",
      value: data?.stats.documentsModified.toLocaleString() || "0",
      change: `${data?.stats.documentsModifiedToday || 0} today`,
      icon: FileText,
    },
    {
      label: "Compliance Checks",
      value: data?.stats.complianceChecks.toString() || "0",
      change: data?.stats.lastComplianceCheck
        ? `Last: ${formatTimestamp(data.stats.lastComplianceCheck)}`
        : "No checks yet",
      icon: ShieldCheck,
    },
  ];

  const eventTypes = [
    { id: "all", name: "All Events", count: data?.eventCounts.all || 0 },
    {
      id: "document",
      name: "Document",
      count: data?.eventCounts.document || 0,
    },
    {
      id: "approval",
      name: "Approval",
      count: data?.eventCounts.approval || 0,
    },
    {
      id: "compliance",
      name: "Compliance",
      count: data?.eventCounts.compliance || 0,
    },
    { id: "user", name: "User", count: data?.eventCounts.user || 0 },
    { id: "integration", name: "Integration", count: data?.eventCounts.integration || 0 },
    { id: "system", name: "System", count: data?.eventCounts.system || 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-6 w-6 rounded-sm" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-48 rounded-sm" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold font-heading">Audit Trail</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete activity log tracking who did what, when, and where
              across your organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-8 rounded-sm text-sm"
              onClick={() => backfillMutation.mutate()}
              disabled={backfillMutation.isPending}
            >
              {backfillMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <History className="h-4 w-4" />
              )}
              Sync Historical Data
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-sm text-sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" className="h-8 rounded-sm text-sm">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Backfill Success Message */}
      {backfillMessage && (
        <div className="mb-4 p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm">
          <Check className="inline h-4 w-4 mr-2" />
          {backfillMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded-sm bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold font-heading">
                  {stat.value}
                </p>
                <p className="text-xs text-emerald-600">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, action, document, or IP address..."
            className="h-8 rounded-sm pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 rounded-sm text-sm">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" className="h-8 rounded-sm text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setEventType(type.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors text-sm ${
              eventType === type.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            }`}
          >
            <span className="text-sm font-medium">{type.name}</span>
            <span className="ml-2 text-xs opacity-70">({type.count})</span>
          </button>
        ))}
      </div>

      {/* Audit Trail Timeline */}
      {data?.auditLogs.length === 0 ? (
        <div className="rounded-sm border bg-card p-8 text-center">
          <Activity className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">No audit events yet</h3>
          <p className="text-sm text-muted-foreground">
            Activity will appear here as users interact with your organization
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.auditLogs.map((log) => {
            const { icon: Icon, color } = getActionIcon(log.action);
            const DeviceIcon = getDeviceIcon(log.device);
            return (
              <div
                key={log.id}
                className="group rounded-sm border bg-card hover:border-primary/50 transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-sm ${color} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              {log.userType === "system" ? (
                                <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-blue-500/10 text-blue-600">
                                  <Bot className="h-3 w-3" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-primary/10 text-primary font-semibold text-[10px]">
                                  {log.userAvatar || "U"}
                                </div>
                              )}
                              <span className="text-sm font-semibold">
                                {log.userName || "Unknown User"}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {log.actionLabel}
                            </span>
                            <div className="px-2 py-0.5 rounded-sm bg-muted">
                              <span className="text-xs font-medium">
                                {log.entityName}
                              </span>
                            </div>
                          </div>
                          {log.metadata &&
                            Object.keys(log.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {log.metadata.oldValue &&
                                  log.metadata.newValue && (
                                    <div className="flex items-center gap-2">
                                      <span className="line-through text-red-600">
                                        {log.metadata.oldValue}
                                      </span>
                                      <span>→</span>
                                      <span className="text-emerald-600">
                                        {log.metadata.newValue}
                                      </span>
                                    </div>
                                  )}
                                {log.metadata.previousStatus &&
                                  log.metadata.newStatus && (
                                    <span>
                                      Status:{" "}
                                      <span className="text-amber-600">
                                        {log.metadata.previousStatus}
                                      </span>{" "}
                                      →{" "}
                                      <span className="text-emerald-600">
                                        {log.metadata.newStatus}
                                      </span>
                                    </span>
                                  )}
                                {log.metadata.regulation && (
                                  <span>
                                    {log.metadata.regulation} • Score:{" "}
                                    {log.metadata.score}%
                                  </span>
                                )}
                                {log.metadata.template && (
                                  <span>
                                    Template: {log.metadata.template} •{" "}
                                    {log.metadata.jurisdiction}
                                  </span>
                                )}
                                {log.metadata.role && (
                                  <span>
                                    Role: {log.metadata.role} • Team:{" "}
                                    {log.metadata.team}
                                  </span>
                                )}
                                {log.metadata.recipients && (
                                  <span>
                                    Recipients: {log.metadata.recipients}
                                  </span>
                                )}
                                {log.metadata.fileSize && (
                                  <span>
                                    File size: {log.metadata.fileSize}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          <span>{log.ipAddress || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3" />
                          <span>{log.location || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon className="h-3 w-3" />
                          <span>{log.device || "Unknown"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-7 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalCount > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {(page - 1) * data.pagination.limit + 1}-
              {Math.min(
                page * data.pagination.limit,
                data.pagination.totalCount,
              )}
            </span>{" "}
            of <span className="font-medium">{data.pagination.totalCount}</span>{" "}
            events
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
