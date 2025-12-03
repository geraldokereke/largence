"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Spinner } from "@largence/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@largence/components/ui/card";
import { Skeleton } from "@largence/components/ui/skeleton";
import { EmptyState } from "@largence/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@largence/components/ui/dialog";
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

export default function CompliancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>(
    [],
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [runningCheckFor, setRunningCheckFor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchComplianceChecks();
    fetchDocuments();
  }, []);

  const fetchComplianceChecks = async () => {
    try {
      const response = await fetch("/api/compliance");
      if (response.ok) {
        const data = await response.json();
        setComplianceChecks(data.complianceChecks || []);
      }
    } catch (error) {
      console.error("Error fetching compliance checks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleRunComplianceCheck = async (documentId: string) => {
    setRunningCheckFor(documentId);
    try {
      const document = documents.find((d) => d.id === documentId);
      const response = await fetch(`/api/documents/${documentId}/compliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: document?.documentType || "Contract",
          jurisdiction: "Nigeria",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Compliance check completed", {
          description: `Score: ${data.complianceCheck.overallScore}/100`,
        });
        setDialogOpen(false);
        fetchComplianceChecks();
      } else {
        toast.error("Compliance check failed");
      }
    } catch (error) {
      console.error("Error running compliance check:", error);
      toast.error("An error occurred");
    } finally {
      setRunningCheckFor(null);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent" };
    if (score >= 60) return { variant: "secondary" as const, label: "Good" };
    return { variant: "destructive" as const, label: "Needs Work" };
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.documentType?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ),
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold font-heading">
            Compliance Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor regulatory compliance and audit your documents
          </p>
        </div>
        {complianceChecks.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Run Compliance Check
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select Document to Audit</DialogTitle>
                <DialogDescription>
                  Choose a document to run compliance checks against NDPR, GDPR,
                  and other regulations
                </DialogDescription>
              </DialogHeader>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? "No documents match your search"
                          : "No documents found"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="link"
                          className="mt-2"
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
                        className="rounded-sm p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() =>
                          !runningCheckFor && handleRunComplianceCheck(doc.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType || "Document"} • Updated{" "}
                                {formatDistanceToNow(new Date(doc.updatedAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          {runningCheckFor === doc.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {complianceChecks.length === 0 ? (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select Document to Audit</DialogTitle>
                <DialogDescription>
                  Choose a document to run compliance checks against NDPR, GDPR,
                  and other regulations
                </DialogDescription>
              </DialogHeader>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-sm"
                />
              </div>

              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? "No documents match your search"
                          : "No documents found"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="link"
                          className="mt-2"
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
                        className="p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() =>
                          !runningCheckFor && handleRunComplianceCheck(doc.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType || "Document"} • Updated{" "}
                                {formatDistanceToNow(new Date(doc.updatedAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          {runningCheckFor === doc.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <EmptyState
            icon={ShieldCheck}
            title="No compliance audits yet"
            description="Start auditing your documents for compliance gaps, missing clauses, and regulatory alignment across NDPR, GDPR, CCPA, and African data protection laws."
            primaryAction={{
              label: "Run Compliance Check",
              onClick: () => setDialogOpen(true),
            }}
            secondaryAction={{
              label: "Upload for Audit",
              onClick: () => router.push("/documents"),
            }}
            showTemplates={false}
          />
        </>
      ) : (
        <div className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-sm border bg-card p-6 hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-sm bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-3xl font-semibold font-heading">
                  {complianceChecks.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  All compliance audits
                </p>
              </div>
            </div>
            <div className="rounded-sm border bg-card p-6 hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-sm bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-3xl font-semibold font-heading">
                  {complianceChecks.filter((c) => c.overallScore >= 80).length}
                </p>
                <p className="text-xs text-emerald-600">Score ≥ 80%</p>
              </div>
            </div>
            <div className="rounded-sm border bg-card p-6 hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-sm bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-3xl font-semibold font-heading">
                  {complianceChecks.filter((c) => c.overallScore < 60).length}
                </p>
                <p className="text-xs text-red-600">Score &lt; 60%</p>
              </div>
            </div>
          </div>

          {/* Compliance Checks List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Recent Compliance Checks</h2>
            <div className="space-y-3">
              {complianceChecks.map((check) => {
                const scoreBadge = getScoreBadge(check.overallScore);
                return (
                  <div
                    key={check.id}
                    className="group rounded-sm border bg-card hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/compliance/${check.id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2.5 rounded-sm shrink-0 ${
                            check.overallScore >= 80
                              ? "bg-emerald-500/10 text-emerald-600"
                              : check.overallScore >= 60
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {check.overallScore >= 80 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : check.overallScore >= 60 ? (
                            <ShieldCheck className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold">
                                  {check.document.title}
                                </span>
                                <div className="px-2 py-0.5 rounded-sm bg-muted">
                                  <span className="text-xs font-medium">
                                    {check.documentType}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <span>
                                  Jurisdiction:{" "}
                                  <span className="font-medium">
                                    {check.jurisdiction}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-2xl font-bold">
                                  {check.overallScore}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  /100
                                </span>
                              </div>
                              <Badge
                                variant={scoreBadge.variant}
                                className="text-xs"
                              >
                                {scoreBadge.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(
                                  new Date(check.createdAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3 w-3" />
                              <span>{check.status}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        </div>
      )}
    </div>
  );
}
