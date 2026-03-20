"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  FileEdit,
  ListChecks,
  Languages,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  PenTool,
  X,
  FileSearch2,
  FileSearch,
  ExternalLink,
  Gavel,
  ScrollText,
  Globe,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ComplianceIssue {
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  suggestion?: string;
}

interface ComplianceResult {
  issues: ComplianceIssue[];
  score: number;
  summary: string;
}

interface EditorSidebarProps {
  documentId: string;
  getContent: () => string;
  setContent: (content: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onContentUpdated?: () => void;
  onOpenSignatureDialog?: () => void;
  onRunAgenticCompliance?: () => void;
  runningAgenticCompliance?: boolean;
  onCancelAgenticCompliance?: () => void;
  onRequireUpgrade?: (options: {
    reason?: string;
    feature?: string;
    currentPlan?: string;
  }) => void;
  onStartDiff?: (originalHTML: string, modifiedHTML: string) => void;
}

const quickActions = [
  {
    id: "improve",
    label: "Improve Writing",
    icon: Wand2,
    prompt:
      "Improve the writing quality, clarity, and professionalism of this document while maintaining its legal accuracy.",
  },
  {
    id: "simplify",
    label: "Simplify Language",
    icon: FileEdit,
    prompt:
      "Simplify the language in this document to make it more readable while preserving legal meaning and enforceability.",
  },
  {
    id: "checklist",
    label: "Add Checklist",
    icon: ListChecks,
    prompt:
      "Add a compliance checklist at the end of this document summarizing key obligations and deadlines for each party.",
  },
  {
    id: "formalize",
    label: "Make Formal",
    icon: Languages,
    prompt:
      "Make this document more formal and professional, using appropriate legal terminology and structure.",
  },
];

const SEVERITY_CONFIG = {
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

export function EditorSidebar({
  documentId,
  getContent,
  setContent,
  isOpen,
  onClose,
  onContentUpdated,
  onOpenSignatureDialog,
  onRunAgenticCompliance,
  runningAgenticCompliance,
  onCancelAgenticCompliance,
  onRequireUpgrade,
  onStartDiff,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<"compliance" | "ai" | "research">(
    "compliance",
  );

  // AI Assistant State
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Compliance State
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceResult | null>(null);

  // Research State
  const [researchQuery, setResearchQuery] = useState("");
  const [researchJurisdiction, setResearchJurisdiction] = useState("all");
  const [isResearching, setIsResearching] = useState(false);
  const [researchSummary, setResearchSummary] = useState<string | null>(null);
  const [researchResults, setResearchResults] = useState<
    | {
        id: string;
        title: string;
        source: string;
        sourceUrl?: string;
        snippet: string;
        type?: string;
        citation?: string;
        jurisdiction?: string;
        date?: string;
      }[]
    | null
  >(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // AI Assistant Functions
  const handleSubmit = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptToUse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsProcessing(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(`/api/documents/${documentId}/ai-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          content: getContent(),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullContent += data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg,
                  ),
                );
              }
              if (data.done) {
                setContent(fullContent);
                onContentUpdated?.();
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: "✓ Document updated successfully!" }
                      : msg,
                  ),
                );
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Request cancelled." }
              : msg,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, something went wrong. Please try again.",
                }
              : msg,
          ),
        );
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  // Compliance Functions
  const handleRunComplianceCheck = useCallback(async () => {
    if (checkingCompliance) return;

    setCheckingCompliance(true);
    setComplianceResult(null);

    try {
      const content = getContent();
      const response = await fetch(`/api/documents/${documentId}/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        // Check if it's a payment required response
        if (response.status === 402) {
          const errorData = await response.json();
          if (onRequireUpgrade) {
            onRequireUpgrade({
              reason:
                errorData.error || "Upgrade required to run compliance checks",
              feature: "compliance",
              currentPlan: errorData.currentPlan,
            });
          }
          setCheckingCompliance(false);
          return;
        }
        throw new Error("Failed to run compliance check");
      }

      const data = await response.json();

      // Parse response - API returns { success, complianceCheck } with overallScore
      const complianceCheck = data.complianceCheck || data;
      const score = complianceCheck.overallScore ?? complianceCheck.score ?? 0;
      const issues = complianceCheck.issues || [];
      const warnings = complianceCheck.warnings || [];
      const suggestions = complianceCheck.suggestions || [];

      // Map issues to the expected format
      const mappedIssues: ComplianceIssue[] = [
        ...issues.map(
          (issue: {
            title?: string;
            message?: string;
            description?: string;
            suggestion?: string;
          }) => ({
            severity: "error" as const,
            title: issue.title || "Issue",
            description: issue.message || issue.description || "",
            suggestion: issue.suggestion,
          }),
        ),
        ...warnings.map(
          (warning: {
            title?: string;
            message?: string;
            description?: string;
            suggestion?: string;
          }) => ({
            severity: "warning" as const,
            title: warning.title || "Warning",
            description: warning.message || warning.description || "",
            suggestion: warning.suggestion,
          }),
        ),
        ...suggestions.map(
          (sugg: {
            title?: string;
            message?: string;
            description?: string;
            suggestion?: string;
          }) => ({
            severity: "info" as const,
            title: sugg.title || "Suggestion",
            description: sugg.message || sugg.description || "",
            suggestion: sugg.suggestion,
          }),
        ),
      ];

      const result: ComplianceResult = {
        score,
        issues: mappedIssues,
        summary:
          score >= 80
            ? "Your document is compliant with most standards."
            : score >= 60
              ? "Your document needs some improvements."
              : "Your document has significant compliance issues.",
      };

      setComplianceResult(result);

      if (mappedIssues.length === 0) {
        toast.success("Compliance check passed!", {
          description: `Score: ${score}/100. No issues found in your document.`,
        });
      } else {
        const errorCount: number = mappedIssues.filter(
          (i: ComplianceIssue) => i.severity === "error",
        ).length;
        const warningCount: number = mappedIssues.filter(
          (i: ComplianceIssue) => i.severity === "warning",
        ).length;

        toast.warning("Compliance check complete", {
          description: `Score: ${score}/100. Found ${errorCount} error(s) and ${warningCount} warning(s).`,
        });
      }
    } catch (error: Error | unknown) {
      console.error("Compliance check error:", error);
      toast.error("Compliance check failed", {
        description: "Failed to run compliance check. Please try again.",
      });
    } finally {
      setCheckingCompliance(false);
    }
  }, [documentId, getContent, checkingCompliance, onRequireUpgrade]);

  const handleRunResearch = useCallback(async () => {
    if (!researchQuery.trim() || isResearching) return;

    setIsResearching(true);
    setResearchResults(null);
    setResearchSummary(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: researchQuery.trim(),
          jurisdiction: researchJurisdiction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Research failed.");

      setResearchSummary(data.summary ?? null);
      setResearchResults(data.results ?? []);
    } catch (err: any) {
      toast.error("Research failed", {
        description: err.message ?? "Please try again.",
      });
      setResearchResults([]);
    } finally {
      setIsResearching(false);
    }
  }, [researchQuery, researchJurisdiction, isResearching]);

  const handleUseInDocument = async (result: {
    title: string;
    source: string;
    snippet: string;
  }) => {
    // Save current content for revert
    const currentHTML = getContent();

    // Simulate finding the right place and injecting the content via AI
    toast.info("Generating intelligent placement...", {
      description: "AI is weaving the research into your document.",
    });

    setTimeout(() => {
      // Dummy implementation to show how "diffing" works inline
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHTML, "text/html");
      const paragraphs = Array.from(doc.querySelectorAll("p")).filter(
        (p) => !p.querySelector("br") && p.textContent?.trim().length,
      );

      let newHTML = currentHTML;
      if (paragraphs.length > 0) {
        // Target a paragraph that isn't the last one if possible to show inline injection better
        const targetIndex = paragraphs.length > 2 ? 2 : paragraphs.length - 1;
        const targetP = paragraphs[targetIndex];
        const originalText = targetP.innerHTML;

        const wrapper = doc.createElement("div");
        wrapper.className =
          "diff-wrapper not-prose my-6 font-sans flex flex-col rounded-sm border border-border shadow-sm bg-card overflow-hidden";
        wrapper.innerHTML = `
             <div class="diff-removed flex items-stretch border-b border-border/60 bg-red-500/5 relative">
               <div class="w-1 bg-red-500 shrink-0"></div>
               <div class="flex-1 p-3">
                 <div class="diff-label flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-red-500 mb-1 opacity-80">
                   Removed
                 </div>
                 <div class="diff-content" style="text-decoration: line-through; color: hsl(var(--destructive)); opacity: 0.7; line-height: 1.6; font-size: 0.95em; margin: 0;">
                    ${originalText}
                 </div>
               </div>
             </div>
             <div class="diff-incoming flex items-stretch bg-emerald-500/5 relative">
               <div class="w-1 bg-emerald-500 shrink-0"></div>
               <div class="flex-1 p-3">
                 <div class="diff-label flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-500 mb-1">
                   Incoming Changes
                 </div>
                 <div class="diff-content" style="color: rgb(16, 185, 129); line-height: 1.6; font-size: 0.95em; margin: 0;">
                    ${originalText} <strong>${result.snippet}</strong>
                 </div>
               </div>
             </div>
           `;
        targetP.parentNode?.replaceChild(wrapper, targetP);
        newHTML = doc.body.innerHTML;
      } else {
        const addedHTML = `
             <div class="diff-wrapper not-prose my-6 font-sans flex flex-col rounded-sm border border-border bg-card shadow-sm overflow-hidden">
               <div class="diff-incoming flex items-stretch bg-emerald-500/5 relative">
                 <div class="w-1 bg-emerald-500 shrink-0"></div>
                 <div class="flex-1 p-3">
                   <div class="diff-label flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-500 mb-1">
                     Incoming Context Added
                   </div>
                   <div class="diff-content" style="color: rgb(16, 185, 129); line-height: 1.6; font-size: 0.95em; margin: 0;">
                      <strong>${result.title}</strong>: ${result.snippet}
                   </div>
                 </div>
               </div>
             </div>
           `;
        newHTML = currentHTML + addedHTML;
      }

      if (onStartDiff) {
        onStartDiff(currentHTML, newHTML);
      } else {
        // Fallback
        setContent(newHTML);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="w-[360px] border-l bg-background flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "compliance" | "ai" | "research")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="compliance" className="text-[10px]">
              <ShieldCheck className="size-2.5 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-[10px]">
              <Sparkles className="size-2.5 mr-1" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="research" className="text-[10px]">
              <FileSearch className="size-2.5 mr-1" />
              Research
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 ml-2 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "compliance" ? (
          <div className="flex flex-col h-full">
            {/* Actions */}
            <div className="p-4 border-b space-y-2 shrink-0">
              <Button
                onClick={handleRunComplianceCheck}
                disabled={checkingCompliance || runningAgenticCompliance}
                className="w-full"
                size="sm"
              >
                {checkingCompliance ? (
                  <>
                    Checking Compliance
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Run Compliance Check
                    <ShieldCheck className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {onRunAgenticCompliance && (
                <Button
                  onClick={
                    runningAgenticCompliance
                      ? onCancelAgenticCompliance
                      : onRunAgenticCompliance
                  }
                  variant={runningAgenticCompliance ? "destructive" : "outline"}
                  disabled={checkingCompliance}
                  className="w-full"
                  size="sm"
                >
                  {runningAgenticCompliance ? (
                    <>
                      Cancel AI Fix
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      AI Auto-Fix Issues
                      <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {onOpenSignatureDialog && (
                <Button
                  onClick={onOpenSignatureDialog}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Request Signature
                  <PenTool className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Results */}
            <ScrollArea className="flex-1 p-4">
              {complianceResult ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Compliance Score
                      </p>
                      <p className="text-2xl font-bold">
                        {complianceResult.score}%
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        complianceResult.score >= 80
                          ? "bg-green-500/20"
                          : complianceResult.score >= 60
                            ? "bg-yellow-500/20"
                            : "bg-destructive/20",
                      )}
                    >
                      {complianceResult.score >= 80 ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : complianceResult.score >= 60 ? (
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-destructive" />
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-muted-foreground">
                    {complianceResult.summary}
                  </p>

                  {/* Issues */}
                  {complianceResult.issues &&
                    complianceResult.issues.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Issues Found</h4>
                        {complianceResult.issues.map((issue, index) => {
                          const config = SEVERITY_CONFIG[issue.severity];
                          const Icon = config.icon;
                          return (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg border",
                                config.bg,
                                config.border,
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <Icon
                                  className={cn("h-4 w-4 mt-0.5", config.color)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">
                                    {issue.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {issue.description}
                                  </p>
                                  {issue.suggestion && (
                                    <p className="text-xs text-primary mt-2">
                                      💡 {issue.suggestion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Show suggestions when score < 100 but no critical issues */}
                  {complianceResult.score < 100 &&
                    complianceResult.score >= 80 &&
                    (!complianceResult.issues ||
                      complianceResult.issues.length === 0) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                          Suggestions for Improvement
                        </h4>
                        <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/20">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                Consider Adding More Detail
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Your document covers the basics but could
                                benefit from additional clauses or more specific
                                terms.
                              </p>
                              <p className="text-xs text-primary mt-2">
                                💡 Review industry-standard templates for
                                additional recommended clauses.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600 dark:text-yellow-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                Optional Enhancements
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Consider adding force majeure, dispute
                                resolution, or amendment procedures.
                              </p>
                              <p className="text-xs text-primary mt-2">
                                💡 Use AI Auto-Fix to automatically add
                                recommended clauses.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {complianceResult.score === 100 &&
                    (!complianceResult.issues ||
                      complianceResult.issues.length === 0) && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h4 className="text-sm font-medium">Perfect Score!</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your document meets all compliance requirements.
                        </p>
                      </div>
                    )}

                  {complianceResult.score < 80 &&
                    (!complianceResult.issues ||
                      complianceResult.issues.length === 0) && (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                        <h4 className="text-sm font-medium">Needs Attention</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your document may be missing important clauses.
                          Consider using AI Auto-Fix to improve it.
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">
                    Compliance Checker
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[280px]">
                    Run a compliance check to identify potential legal issues,
                    missing clauses, and areas for improvement.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : activeTab === "ai" ? (
          <div className="flex flex-col h-full">
            {/* Quick Actions */}
            <div className="px-4 py-3 border-b shrink-0">
              <p className="text-xs text-muted-foreground mb-2">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSubmit(action.prompt)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <action.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <Bot className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">Largence AI</h3>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      Ask me to edit, improve, or modify your document. I can
                      help with formatting, language, and content changes.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearHistory}
                        className="h-6 px-2 text-xs text-muted-foreground"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="p-1.5 rounded-lg bg-primary/10 h-fit shrink-0">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 max-w-[85%] text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                            {message.content || (
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processing...
                              </span>
                            )}
                          </p>
                          {message.role === "assistant" &&
                            message.content &&
                            !message.content.startsWith("✓") &&
                            !message.content.includes("cancelled") &&
                            !message.content.includes("wrong") && (
                              <button
                                onClick={() =>
                                  handleCopy(message.content, message.id)
                                }
                                className="mt-1.5 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                {copiedId === message.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy response
                                  </>
                                )}
                              </button>
                            )}
                        </div>
                        {message.role === "user" && (
                          <div className="p-1.5 rounded-lg bg-primary h-fit shrink-0">
                            <User className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t shrink-0 bg-background">
              <div className="flex gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask AI to edit your document..."
                  className="min-h-[72px] resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground">
                  Press Enter to send
                </p>
                {isProcessing ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSubmit()}
                    disabled={!prompt.trim()}
                    className="h-7 text-xs"
                  >
                    Send
                    <Send className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Input Area */}
            <div className="p-4 border-b shrink-0 bg-background space-y-2">
              <Select
                value={researchJurisdiction}
                onValueChange={setResearchJurisdiction}
                disabled={isResearching}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Global</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="eu">European Union</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia / NZ</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="latam">Latin America</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                placeholder="E.g., Cases on force majeure in commercial contracts…"
                className="min-h-17 resize-none text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRunResearch();
                  }
                }}
                disabled={isResearching}
              />

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Enter to search
                </p>
                <Button
                  size="sm"
                  onClick={handleRunResearch}
                  disabled={!researchQuery.trim() || isResearching}
                  className="h-7 text-xs"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <FileSearch className="h-3 w-3 mr-1" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results Area */}
            <ScrollArea className="flex-1 px-3">
              <div className="py-3 space-y-3">
                {/* Empty state */}
                {!researchResults && !isResearching && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <FileSearch2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">Legal Research</h3>
                    <p className="text-xs text-muted-foreground max-w-60">
                      Search cases, statutes, treaties, and academic sources
                      from global legal databases.
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isResearching && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    <div>
                      <p className="text-xs font-medium">
                        Searching legal databases…
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        This may take 10–20 seconds
                      </p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {researchResults && !isResearching && (
                  <>
                    {/* AI Summary */}
                    {researchSummary && (
                      <div className="rounded-sm border border-primary/20 bg-primary/5 p-3 flex gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground/90 leading-relaxed">
                          {researchSummary}
                        </p>
                      </div>
                    )}

                    {researchResults.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No results found. Try refining your query.
                      </p>
                    ) : (
                      <>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {researchResults.length} result
                          {researchResults.length !== 1 ? "s" : ""}
                        </p>
                        {researchResults.map((result) => {
                          const TypeIcon =
                            result.type === "case"
                              ? Gavel
                              : result.type === "statute"
                                ? ScrollText
                                : result.type === "regulation"
                                  ? FileSearch
                                  : result.type === "treaty"
                                    ? Globe
                                    : result.type === "article"
                                      ? BookOpen
                                      : FileEdit;

                          const typeColor =
                            result.type === "case"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : result.type === "statute"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : result.type === "regulation"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : result.type === "treaty"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : result.type === "article"
                                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                      : "bg-muted text-muted-foreground";

                          return (
                            <div
                              key={result.id}
                              className="p-3 rounded-sm border bg-card hover:border-primary/30 hover:bg-accent/30 transition-colors group"
                            >
                              {/* Type + jurisdiction badges */}
                              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                {result.type && (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wide",
                                      typeColor,
                                    )}
                                  >
                                    <TypeIcon className="w-2 h-2" />
                                    {result.type}
                                  </span>
                                )}
                                {result.jurisdiction && (
                                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm font-medium">
                                    {result.jurisdiction}
                                  </span>
                                )}
                                {result.date && (
                                  <span className="text-[9px] text-muted-foreground">
                                    {result.date}
                                  </span>
                                )}
                              </div>

                              {/* Title + external link */}
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1">
                                  {result.title}
                                </h4>
                                {result.sourceUrl &&
                                  result.sourceUrl !== "#" && (
                                    <a
                                      href={result.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors mt-0.5"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                              </div>

                              {/* Source */}
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium mb-1">
                                {result.source}
                              </p>

                              {/* Citation */}
                              {result.citation && (
                                <p className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm mb-1.5 break-all">
                                  {result.citation}
                                </p>
                              )}

                              {/* Snippet */}
                              <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                                {result.snippet}
                              </p>

                              {/* Actions */}
                              <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-border/40 text-[10px] font-medium text-muted-foreground">
                                <button
                                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                                  onClick={() =>
                                    handleCopy(
                                      [
                                        result.citation,
                                        result.title,
                                        result.source,
                                      ]
                                        .filter(Boolean)
                                        .join(" — "),
                                      result.id,
                                    )
                                  }
                                >
                                  {copiedId === result.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-green-500" />{" "}
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" /> Cite
                                    </>
                                  )}
                                </button>
                                <button
                                  className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                                  onClick={() => handleUseInDocument(result)}
                                >
                                  <FileEdit className="h-3 w-3" />
                                  Use in doc
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
