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
} from "lucide-react";
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
  onRequireUpgrade?: (options: { reason?: string; feature?: string; currentPlan?: string }) => void;
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
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<"compliance" | "ai">("compliance");

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
                      : msg
                  )
                );
              }
              if (data.done) {
                setContent(fullContent);
                onContentUpdated?.();
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: "✓ Document updated successfully!" }
                      : msg
                  )
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
              : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, something went wrong. Please try again.",
                }
              : msg
          )
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
              reason: errorData.error || "Upgrade required to run compliance checks",
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
      setComplianceResult(data);

      const issues = data.issues || [];
      if (issues.length === 0) {
        toast.success("Compliance check passed!", {
          description: "No issues found in your document.",
        });
      } else {
        const errorCount = issues.filter(
          (i: ComplianceIssue) => i.severity === "error"
        ).length;
        const warningCount = issues.filter(
          (i: ComplianceIssue) => i.severity === "warning"
        ).length;

        toast.warning("Compliance check complete", {
          description: `Found ${errorCount} error(s) and ${warningCount} warning(s).`,
        });
      }
    } catch (error) {
      console.error("Compliance check error:", error);
      toast.error("Compliance check failed", {
        description: "Failed to run compliance check. Please try again.",
      });
    } finally {
      setCheckingCompliance(false);
    }
  }, [documentId, getContent, checkingCompliance, onRequireUpgrade]);

  if (!isOpen) return null;

  return (
    <div className="w-[360px] border-l bg-background flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "compliance" | "ai")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="compliance" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI Assistant
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
                  onClick={runningAgenticCompliance ? onCancelAgenticCompliance : onRunAgenticCompliance}
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
                            : "bg-destructive/20"
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
                  {complianceResult.issues && complianceResult.issues.length > 0 && (
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
                              config.border
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

                  {(!complianceResult.issues || complianceResult.issues.length === 0) && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h4 className="text-sm font-medium">All Clear!</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        No compliance issues found in your document.
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
        ) : (
          <div className="flex flex-col h-full">
            {/* Quick Actions */}
            <div className="px-4 py-3 border-b shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
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
                            : "justify-start"
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
                              : "bg-muted"
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
        )}
      </div>
    </div>
  );
}
