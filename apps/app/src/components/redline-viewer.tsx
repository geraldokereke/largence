"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  GitCompare,
  Loader2,
  Plus,
  Minus,
  Equal,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DocumentVersion {
  id: string;
  versionNumber: number;
  title: string;
  createdAt: string;
  changeType: string;
  changeSummary: string | null;
}

interface DiffResult {
  htmlDiff: string;
  statistics: {
    additions: number;
    deletions: number;
    unchanged: number;
    total: number;
  };
  versions: {
    from: string;
    to: string;
  };
}

interface RedlineViewerProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RedlineViewer({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: RedlineViewerProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [version1, setVersion1] = useState<string>("");
  const [version2, setVersion2] = useState<string>("current");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, documentId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
        if (data.versions.length > 0) {
          setVersion1(data.versions[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast.error("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!version1) {
      toast.error("Please select a version to compare");
      return;
    }

    setComparing(true);
    try {
      const params = new URLSearchParams();
      params.set("v1", version1);
      if (version2 !== "current") {
        params.set("v2", version2);
      }

      const response = await fetch(
        `/api/documents/${documentId}/compare?${params.toString()}`
      );

      if (response.ok) {
        const result = await response.json();
        setDiffResult(result);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to compare versions");
      }
    } catch (error) {
      console.error("Error comparing versions:", error);
      toast.error("Failed to compare versions");
    } finally {
      setComparing(false);
    }
  };

  const getVersionLabel = (version: DocumentVersion) => {
    return `v${version.versionNumber} - ${format(new Date(version.createdAt), "MMM d, h:mm a")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Redline / Compare Versions
          </DialogTitle>
          <DialogDescription>
            Compare different versions of &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Version Selection */}
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">From Version</label>
              <Select value={version1} onValueChange={setVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="p-2 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No versions available
                    </div>
                  ) : (
                    versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {getVersionLabel(v)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">To Version</label>
              <Select value={version2} onValueChange={setVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Version</SelectItem>
                  {versions.map((v) => (
                    <SelectItem
                      key={v.id}
                      value={v.id}
                      disabled={v.id === version1}
                    >
                      {getVersionLabel(v)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCompare}
              disabled={comparing || !version1}
              className="mt-6"
            >
              Compare
              {comparing ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <GitCompare className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Diff Result */}
          {diffResult && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Statistics */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-700 dark:text-green-400"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {diffResult.statistics.additions} added
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-700 dark:text-red-400"
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    {diffResult.statistics.deletions} removed
                  </Badge>
                  <Badge variant="secondary">
                    <Equal className="h-3 w-3 mr-1" />
                    {diffResult.statistics.unchanged} unchanged
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {diffResult.versions.from} → {diffResult.versions.to}
                </div>
              </div>

              {/* Diff Content */}
              <div className="flex-1 overflow-auto rounded-lg border bg-card">
                <style jsx global>{`
                  .diff-added {
                    background-color: rgb(34 197 94 / 0.2);
                    color: rgb(22 163 74);
                    text-decoration: none;
                    padding: 1px 2px;
                    border-radius: 2px;
                  }
                  .dark .diff-added {
                    background-color: rgb(34 197 94 / 0.15);
                    color: rgb(74 222 128);
                  }
                  .diff-removed {
                    background-color: rgb(239 68 68 / 0.2);
                    color: rgb(220 38 38);
                    text-decoration: line-through;
                    padding: 1px 2px;
                    border-radius: 2px;
                  }
                  .dark .diff-removed {
                    background-color: rgb(239 68 68 / 0.15);
                    color: rgb(248 113 113);
                  }
                  .diff-unchanged {
                    color: inherit;
                  }
                `}</style>
                <div
                  className="p-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: diffResult.htmlDiff }}
                />
              </div>
            </div>
          )}

          {!diffResult && !comparing && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <GitCompare className="h-12 w-12 mx-auto opacity-50" />
                <p>Select versions and click Compare to see differences</p>
              </div>
            </div>
          )}

          {comparing && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Comparing versions...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
