"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@largence/components/ui/button";
import { Spinner } from "@largence/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@largence/components/ui/card";
import { Separator } from "@largence/components/ui/separator";
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ComplianceIssue {
  rule: string;
  severity: "critical" | "warning" | "info";
  message: string;
  suggestion?: string;
}

interface ComplianceCheck {
  id: string;
  documentId: string;
  status: string;
  overallScore: number;
  issues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  suggestions: ComplianceIssue[];
  rulesChecked: string[];
  jurisdiction: string;
  documentType: string;
  createdAt: string;
  document: {
    title: string;
  };
}

export default function ComplianceResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [complianceCheck, setComplianceCheck] =
    useState<ComplianceCheck | null>(null);

  useEffect(() => {
    const fetchComplianceCheck = async () => {
      try {
        const response = await fetch(`/api/compliance/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setComplianceCheck(data.complianceCheck);
        } else {
          router.push("/compliance");
        }
      } catch (error) {
        console.error("Error loading compliance check:", error);
        router.push("/compliance");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchComplianceCheck();
    }
  }, [params.id, router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      warning: "outline",
      info: "secondary",
    } as const;

    return (
      <Badge
        variant={variants[severity as keyof typeof variants] || "secondary"}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!complianceCheck) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Compliance check not found</p>
          <Button onClick={() => router.push("/compliance")} className="mt-4">
            Go to Compliance
          </Button>
        </div>
      </div>
    );
  }

  const allIssues = [
    ...complianceCheck.issues.map((i) => ({ ...i, category: "issue" })),
    ...complianceCheck.warnings.map((w) => ({ ...w, category: "warning" })),
    ...complianceCheck.suggestions.map((s) => ({
      ...s,
      category: "suggestion",
    })),
  ];

  const criticalIssues = allIssues.filter((i) => i.severity === "critical");
  const warningIssues = allIssues.filter((i) => i.severity === "warning");
  const infoIssues = allIssues.filter((i) => i.severity === "info");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header - Fixed height like editor */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        {/* Title Bar - Fixed 52px height */}
        <div
          className="grid items-center px-3 gap-3 h-[52px]"
          style={{ gridTemplateColumns: "auto 1fr auto" }}
        >
          {/* Left: Back button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/compliance")}
              className="h-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Center: Document title */}
          <div className="flex items-center justify-center gap-2 min-w-0">
            <Separator orientation="vertical" className="h-5" />
            <h1 className="font-semibold text-base truncate max-w-[180px] sm:max-w-[400px] text-center">
              {complianceCheck.document.title}
            </h1>
            <Separator orientation="vertical" className="h-5" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/documents/${complianceCheck.documentId}`)
              }
              className="h-8"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-1.5">View Document</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Compliance Report</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(complianceCheck.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>•</span>
            <Badge variant="outline" className="text-xs">
              {complianceCheck.documentType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {complianceCheck.jurisdiction}
            </Badge>
          </div>

          {/* Overall Score Card */}
          <Card
            className={`rounded-sm p-6 border-2 ${getScoreColor(complianceCheck.overallScore)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">
                  Overall Compliance Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    {complianceCheck.overallScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-sm mt-2 font-medium">
                  {getScoreLabel(complianceCheck.overallScore)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-background/80 mb-2">
                  {complianceCheck.overallScore >= 80 ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  ) : complianceCheck.overallScore >= 60 ? (
                    <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {complianceCheck.rulesChecked.length} rules checked
                </p>
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card
              className={`rounded-sm p-4 ${criticalIssues.length > 0 ? "border-red-500/30 bg-red-500/10" : "border-muted"}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {criticalIssues.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Critical Issues
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`rounded-sm p-4 ${warningIssues.length > 0 ? "border-amber-500/30 bg-amber-500/10" : "border-muted"}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-amber-500/10">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {warningIssues.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </div>
            </Card>
            <Card
              className={`rounded-sm p-4 ${infoIssues.length > 0 ? "border-blue-500/30 bg-blue-500/10" : "border-muted"}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-500/10">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {infoIssues.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Suggestions</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold">Critical Issues</h2>
                <Badge variant="destructive" className="ml-auto">
                  {criticalIssues.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {criticalIssues.map((issue, index) => (
                  <Card
                    key={index}
                    className="rounded-sm p-4 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{issue.rule}</p>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <div className="mt-3 p-3 bg-background rounded-sm border border-red-500/20">
                            <p className="text-sm">
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                💡 Suggestion:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {issue.suggestion}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warningIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Warnings</h2>
                <Badge
                  variant="outline"
                  className="ml-auto border-amber-500/50 text-amber-600 dark:text-amber-400"
                >
                  {warningIssues.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {warningIssues.map((issue, index) => (
                  <Card
                    key={index}
                    className="rounded-sm p-4 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{issue.rule}</p>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <div className="mt-3 p-3 bg-background rounded-sm border border-amber-500/20">
                            <p className="text-sm">
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                💡 Suggestion:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {issue.suggestion}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {infoIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Suggestions</h2>
                <Badge variant="secondary" className="ml-auto">
                  {infoIssues.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {infoIssues.map((issue, index) => (
                  <Card
                    key={index}
                    className="rounded-sm p-4 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{issue.rule}</p>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <div className="mt-3 p-3 bg-background rounded-sm border border-blue-500/20">
                            <p className="text-sm">
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                💡 Suggestion:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {issue.suggestion}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Issues - All Clear */}
          {allIssues.length === 0 && (
            <Card className="rounded-sm p-12 text-center border-emerald-500/30 bg-emerald-500/10">
              <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-emerald-500/20 mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No compliance issues found. Your document meets all checked
                requirements for {complianceCheck.jurisdiction}.
              </p>
            </Card>
          )}

          {/* Rules Checked */}
          <Card className="rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Rules Checked</h3>
              <Badge variant="secondary">
                {complianceCheck.rulesChecked.length} total
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {complianceCheck.rulesChecked.map((rule, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rule}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Bottom Actions */}
          <div className="flex gap-3 pb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/compliance")}
              className="rounded-sm flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Compliance Checks
            </Button>
            <Button
              onClick={() =>
                router.push(`/documents/${complianceCheck.documentId}`)
              }
              className="rounded-sm flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
