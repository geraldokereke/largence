"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Spinner } from "@largence/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@largence/components/ui/card";
import { Skeleton } from "@largence/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@largence/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@largence/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Play,
  Clock,
  TrendingUp,
  Search,
  RefreshCw,
  Upload,
  Download,
  Calendar,
  File,
  X,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ComplianceCheck {
  id: string;
  documentId: string;
  status: string;
  overallScore: number;
  jurisdiction: string;
  documentType: string;
  createdAt: string;
  document: {
    title: string;
  };
}

interface Document {
  id: string;
  title: string;
  documentType: string;
  updatedAt: string;
}

async function fetchComplianceChecks(): Promise<{ 
  complianceChecks: ComplianceCheck[];
  stats: {
    total: number;
    passed: number;
    needsWork: number;
    thisWeek: number;
  };
}> {
  const response = await fetch("/api/compliance");
  if (!response.ok) throw new Error("Failed to fetch compliance checks");
  const data = await response.json();
  
  // Calculate stats
  const checks = data.complianceChecks || [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return {
    complianceChecks: checks,
    stats: {
      total: checks.length,
      passed: checks.filter((c: ComplianceCheck) => c.overallScore >= 80).length,
      needsWork: checks.filter((c: ComplianceCheck) => c.overallScore < 60).length,
      thisWeek: checks.filter((c: ComplianceCheck) => new Date(c.createdAt) > weekAgo).length,
    }
  };
}

async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch("/api/documents");
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

async function runComplianceCheck({
  documentId,
  documentType,
}: {
  documentId: string;
  documentType: string;
}): Promise<{ complianceCheck: ComplianceCheck }> {
  const response = await fetch(`/api/documents/${documentId}/compliance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentType: documentType || "Contract",
      jurisdiction: "Nigeria",
    }),
  });
  if (!response.ok) throw new Error("Failed to run compliance check");
  return response.json();
}

async function runComplianceCheckOnFile(file: File): Promise<{ complianceCheck: ComplianceCheck }> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/compliance/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to run compliance check on file");
  return response.json();
}

export default function CompliancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<"documents" | "upload">("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch compliance checks
  const {
    data: complianceData,
    isLoading: complianceLoading,
    error: complianceError,
    refetch: refetchCompliance,
  } = useQuery({
    queryKey: ["compliance-checks"],
    queryFn: fetchComplianceChecks,
  });

  // Fetch documents
  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  // Run compliance check mutation
  const runCheckMutation = useMutation({
    mutationFn: runComplianceCheck,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-checks"] });
      toast.success("Compliance check completed", {
        description: `Score: ${data.complianceCheck.overallScore}/100`,
      });
      setDialogOpen(false);
      
      // Mark onboarding item as complete
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding:ran_compliance", "true");
        window.dispatchEvent(new CustomEvent("onboarding:progress"));
      }
    },
    onError: () => {
      toast.error("Compliance check failed", {
        description: "Please try again later",
      });
    },
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: runComplianceCheckOnFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-checks"] });
      toast.success("Compliance check completed", {
        description: `Score: ${data.complianceCheck.overallScore}/100`,
      });
      setDialogOpen(false);
      setUploadedFile(null);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding:ran_compliance", "true");
        window.dispatchEvent(new CustomEvent("onboarding:progress"));
      }
    },
    onError: () => {
      toast.error("Compliance check failed", {
        description: "Please try again later",
      });
    },
  });

  const complianceChecks = complianceData?.complianceChecks || [];
  const stats = complianceData?.stats || { total: 0, passed: 0, needsWork: 0, thisWeek: 0 };
  const documents = documentsData?.documents || [];
  const isLoading = complianceLoading || documentsLoading;

  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.documentType?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // Filter compliance checks
  const filteredChecks = useMemo(() => {
    let filtered = complianceChecks;
    
    if (filterSearch) {
      filtered = filtered.filter(
        (check) =>
          check.document.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
          check.documentType.toLowerCase().includes(filterSearch.toLowerCase()) ||
          check.jurisdiction.toLowerCase().includes(filterSearch.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      if (statusFilter === "passed") {
        filtered = filtered.filter((c) => c.overallScore >= 80);
      } else if (statusFilter === "warning") {
        filtered = filtered.filter((c) => c.overallScore >= 60 && c.overallScore < 80);
      } else if (statusFilter === "failed") {
        filtered = filtered.filter((c) => c.overallScore < 60);
      }
    }
    
    return filtered;
  }, [complianceChecks, filterSearch, statusFilter]);

  const handleRunComplianceCheck = (doc: Document) => {
    runCheckMutation.mutate({
      documentId: doc.id,
      documentType: doc.documentType,
    });
  };

  const handleFileUpload = () => {
    if (uploadedFile) {
      uploadMutation.mutate(uploadedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "text/plain")) {
      setUploadedFile(file);
    } else {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, DOCX, or TXT file",
      });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent", color: "text-emerald-600" };
    if (score >= 60) return { variant: "secondary" as const, label: "Good", color: "text-amber-600" };
    return { variant: "destructive" as const, label: "Needs Work", color: "text-red-600" };
  };

  const statusFilters = [
    { id: "all", name: "All Results", count: complianceChecks.length },
    { id: "passed", name: "Passed", count: stats.passed },
    { id: "warning", name: "Warnings", count: complianceChecks.filter((c) => c.overallScore >= 60 && c.overallScore < 80).length },
    { id: "failed", name: "Failed", count: stats.needsWork },
  ];

  const statCards = [
    {
      label: "Total Audits",
      value: stats.total.toString(),
      change: `${stats.thisWeek} this week`,
      icon: ShieldCheck,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Passed",
      value: stats.passed.toString(),
      change: "Score ≥ 80",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Warnings",
      value: complianceChecks.filter((c) => c.overallScore >= 60 && c.overallScore < 80).length.toString(),
      change: "Score 60-79",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Needs Work",
      value: stats.needsWork.toString(),
      change: "Score < 60",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-500/10",
    },
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
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-40" />
            </div>
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
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (complianceError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-3">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-base font-semibold mb-1.5">Failed to load compliance data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your compliance checks.
        </p>
        <Button onClick={() => refetchCompliance()} variant="outline" className="rounded-sm h-8 text-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-3">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h1 className="text-xl font-semibold font-display">Compliance Center</h1>
            <p className="text-sm text-muted-foreground">
              Audit your documents for regulatory compliance across NDPR, GDPR, CCPA, and African data protection laws
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-8 rounded-sm text-sm flex-1 sm:flex-none"
              onClick={() => refetchCompliance()}
              disabled={complianceLoading}
            >
              <RefreshCw className={`h-4 w-4 ${complianceLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 rounded-sm text-sm gap-2 flex-1 sm:flex-none">
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Run Compliance Audit</span>
                  <span className="sm:hidden">Audit</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Run Compliance Audit</DialogTitle>
                  <DialogDescription>
                    Select a document or upload a file to check for compliance
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as "documents" | "upload")}>
                  <TabsList className="mb-4 h-9 p-1 rounded-sm w-full">
                    <TabsTrigger value="documents" className="flex-1 text-sm rounded-sm h-7">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      My Documents
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 text-sm rounded-sm h-7">
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="mt-0">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-sm h-8 text-sm"
                      />
                    </div>

                    <ScrollArea className="max-h-[300px] pr-4">
                      <div className="space-y-2">
                        {filteredDocuments.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {searchQuery ? "No documents match your search" : "No documents found"}
                            </p>
                            {!searchQuery && (
                              <Button
                                variant="link"
                                className="mt-2 text-sm"
                                onClick={() => router.push("/documents")}
                              >
                                Create a document first
                              </Button>
                            )}
                          </div>
                        ) : (
                          filteredDocuments.map((doc) => (
                            <Card
                              key={doc.id}
                              className="rounded-sm p-3 hover:border-primary transition-colors cursor-pointer"
                              onClick={() => !runCheckMutation.isPending && handleRunComplianceCheck(doc)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                                    <FileText className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{doc.title}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {doc.documentType || "Document"} • {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                                {runCheckMutation.isPending && runCheckMutation.variables?.documentId === doc.id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <Button size="sm" variant="ghost" className="h-7 rounded-sm">
                                    <Play className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    <div
                      className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
                        isDragging ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {uploadedFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3 p-3 rounded-sm bg-muted">
                            <File className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium text-sm">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 w-7 p-0"
                              onClick={() => setUploadedFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            onClick={handleFileUpload}
                            disabled={uploadMutation.isPending}
                            className="h-8 rounded-sm text-sm"
                          >
                            {uploadMutation.isPending ? (
                              <>
                                Analyzing...
                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                              </>
                            ) : (
                              <>
                                Run Compliance Check
                                <ShieldCheck className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-sm font-semibold mb-1">Drop your file here</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            Supports PDF, DOCX, and TXT files up to 10MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setUploadedFile(file);
                            }}
                          />
                          <Button
                            variant="outline"
                            className="h-8 rounded-sm text-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-1.5 rounded-sm ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold font-heading">{stat.value}</p>
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
            placeholder="Search by document, type, or jurisdiction..."
            className="h-8 rounded-sm pl-9 text-sm"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 rounded-sm text-sm">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" className="h-8 rounded-sm text-sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors text-sm ${
              statusFilter === filter.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            }`}
          >
            <span className="text-sm font-medium">{filter.name}</span>
            <span className="ml-2 text-xs opacity-70">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Compliance Checks List */}
      {filteredChecks.length === 0 ? (
        <div className="rounded-sm border bg-card p-8 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">
            {complianceChecks.length === 0 ? "No compliance audits yet" : "No matching results"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {complianceChecks.length === 0
              ? "Start auditing your documents for compliance gaps and regulatory alignment"
              : "Try adjusting your filters or search terms"}
          </p>
          {complianceChecks.length === 0 && (
            <Button onClick={() => setDialogOpen(true)} className="h-8 rounded-sm text-sm">
              <Play className="h-4 w-4 mr-2" />
              Run First Audit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChecks.map((check) => {
            const scoreBadge = getScoreBadge(check.overallScore);
            return (
              <div
                key={check.id}
                className="group rounded-sm border bg-card hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => router.push(`/compliance/${check.id}`)}
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1.5 rounded-sm shrink-0 ${
                        check.overallScore >= 80
                          ? "bg-emerald-500/10 text-emerald-600"
                          : check.overallScore >= 60
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {check.overallScore >= 80 ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : check.overallScore >= 60 ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm font-semibold truncate">
                            {check.document.title}
                          </span>
                          <div className="px-1.5 py-0.5 rounded-sm bg-muted">
                            <span className="text-xs">{check.documentType}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {check.jurisdiction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-bold ${scoreBadge.color}`}>
                            {check.overallScore}%
                          </span>
                          <Badge variant={scoreBadge.variant} className="text-xs h-5">
                            {scoreBadge.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(check.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3" />
                          <span>{check.status}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-6 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/compliance/${check.id}`);
                          }}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
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
    </div>
  );
}
