"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@largence/components/ui/skeleton";
import {
  History,
  Clock,
  User,
  ArrowRight,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  GitBranch,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface DocumentVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  status: string;
  changeType: string;
  changeSummary: string | null;
  changedFields: string[];
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  auditLogId: string | null;
  createdAt: string;
}

interface DocumentHistoryResponse {
  document: {
    id: string;
    title: string;
    currentContent: string;
    status: string;
  };
  versions: DocumentVersion[];
  totalVersions: number;
}

interface DocumentHistoryViewerProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType) {
    case "CREATE":
      return { icon: FileText, color: "text-emerald-600 bg-emerald-500/10" };
    case "EDIT":
      return { icon: Edit, color: "text-amber-600 bg-amber-500/10" };
    case "STATUS_CHANGE":
      return { icon: AlertCircle, color: "text-blue-600 bg-blue-500/10" };
    case "AI_REGENERATE":
      return { icon: Sparkles, color: "text-purple-600 bg-purple-500/10" };
    case "COMPLIANCE_FIX":
      return { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-500/10" };
    case "RESTORE":
      return { icon: RotateCcw, color: "text-blue-600 bg-blue-500/10" };
    default:
      return { icon: Edit, color: "text-slate-600 bg-slate-500/10" };
  }
};

const getChangeTypeLabel = (changeType: string) => {
  switch (changeType) {
    case "CREATE":
      return "Created";
    case "EDIT":
      return "Edited";
    case "STATUS_CHANGE":
      return "Status Changed";
    case "AI_REGENERATE":
      return "AI Regenerated";
    case "COMPLIANCE_FIX":
      return "Compliance Fix";
    case "RESTORE":
      return "Restored";
    default:
      return changeType;
  }
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-amber-500/10 text-amber-600",
  FINAL: "bg-emerald-500/10 text-emerald-600",
  ARCHIVED: "bg-slate-500/10 text-slate-600",
};

export function DocumentHistoryViewer({
  documentId,
  documentTitle,
  open,
  onClose,
  onRestoreSuccess,
}: DocumentHistoryViewerProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<DocumentHistoryResponse>({
    queryKey: ["document-versions", documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) throw new Error("Failed to fetch versions");
      return response.json();
    },
    enabled: open,
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await fetch(
        `/api/documents/${documentId}/versions/${versionId}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to restore version");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-versions", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      onRestoreSuccess?.();
    },
  });

  const toggleVersionExpand = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  const handleRestore = (versionId: string) => {
    if (confirm("Are you sure you want to restore this version? The current document content will be replaced.")) {
      restoreMutation.mutate(versionId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4 pr-8">
            <div className="inline-flex p-2 rounded-sm bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-lg font-heading">
                  Document History
                </DialogTitle>
                <Badge variant="outline" className="rounded-sm text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {data?.totalVersions || 0} versions
                </Badge>
              </div>
              <DialogDescription className="text-sm">
                View and restore previous versions of "{documentTitle}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-sm border p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-sm" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-red-500/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Failed to load version history
                </p>
              </div>
            ) : data?.versions.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-base font-semibold mb-2">No version history yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Version history will be recorded as you make changes to this document.
                  Each significant edit creates a new version you can view or restore.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-4">
                  {/* Current version indicator */}
                  <div className="relative flex items-center gap-4 pl-10">
                    <div className="absolute left-0 w-8 h-8 rounded-sm bg-emerald-500/10 flex items-center justify-center z-10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 rounded-sm border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-700">
                            Current Version
                          </span>
                          <Badge className={`rounded-sm text-xs ${statusColors[data?.document.status || "DRAFT"]}`}>
                            {data?.document.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Now</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {data?.document.title}
                      </p>
                    </div>
                  </div>

                  {/* Version history */}
                  {data?.versions.map((version, index) => {
                    const { icon: Icon, color } = getChangeTypeIcon(version.changeType);
                    const isExpanded = expandedVersion === version.id;

                    return (
                      <div key={version.id} className="relative flex items-start gap-4 pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-sm ${color} flex items-center justify-center z-10`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 rounded-sm border bg-card hover:border-primary/30 transition-colors">
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => toggleVersionExpand(version.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  Version {version.version}
                                </span>
                                <Badge variant="outline" className="rounded-sm text-xs">
                                  {getChangeTypeLabel(version.changeType)}
                                </Badge>
                                <Badge className={`rounded-sm text-xs ${statusColors[version.status]}`}>
                                  {version.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              {version.changeSummary || `Changed: ${version.changedFields.join(", ")}`}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span>{version.userName || "Unknown"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="border-t bg-muted/30 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold">Document content at this version</h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 rounded-sm text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Could open in new window or preview
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 rounded-sm text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestore(version.id);
                                    }}
                                    disabled={restoreMutation.isPending}
                                  >
                                    {restoreMutation.isPending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-3 w-3" />
                                    )}
                                    Restore This Version
                                  </Button>
                                </div>
                              </div>

                              <div className="rounded-sm border bg-card p-3 mb-3">
                                <p className="text-xs text-muted-foreground mb-1">Title:</p>
                                <p className="text-sm font-medium">{version.title}</p>
                              </div>

                              <div className="rounded-sm border bg-card">
                                <div className="p-3 border-b bg-muted/50">
                                  <p className="text-xs text-muted-foreground">Content Preview</p>
                                </div>
                                <div className="p-3 max-h-64 overflow-auto">
                                  <div 
                                    className="text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs"
                                    dangerouslySetInnerHTML={{ 
                                      __html: version.content.substring(0, 3000) + 
                                        (version.content.length > 3000 ? '<p class="text-muted-foreground/50 mt-4">... (content truncated)</p>' : '')
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Version history is automatically saved when you make changes to the document.
            </p>
            <Button variant="outline" className="h-8 rounded-sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
