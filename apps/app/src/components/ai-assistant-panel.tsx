"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@largence/components/ui/button";
import { Textarea } from "@largence/components/ui/textarea";
import { ScrollArea } from "@largence/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@largence/components/ui/sheet";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  FileEdit,
  ListChecks,
  Languages,
  Eraser,
  ChevronRight,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@largence/lib/utils";

// Thinking animation component
const ThinkingIndicator = () => {
  const [thinkingText, setThinkingText] = useState("Analyzing document");
  const [dots, setDots] = useState("");
  
  const thinkingStates = [
    "Analyzing document",
    "Understanding context",
    "Processing request",
    "Generating response",
    "Refining content",
    "Applying changes",
  ];

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    // Cycle through thinking states
    let stateIndex = 0;
    const stateInterval = setInterval(() => {
      stateIndex = (stateIndex + 1) % thinkingStates.length;
      setThinkingText(thinkingStates[stateIndex]);
    }, 2500);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stateInterval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
        </div>
        <span className="text-xs text-muted-foreground">
          {thinkingText}<span className="inline-block w-4">{dots}</span>
        </span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AiAssistantPanelProps {
  documentId: string;
  getContent: () => string;
  setContent: (content: string) => void;
  onContentUpdated?: () => void;
}

const quickActions = [
  {
    id: "improve",
    label: "Improve Writing",
    icon: Wand2,
    prompt: "Improve the writing quality, clarity, and professionalism of this document while maintaining its legal accuracy.",
  },
  {
    id: "simplify",
    label: "Simplify Language",
    icon: FileEdit,
    prompt: "Simplify the language in this document to make it more readable while preserving legal meaning and enforceability.",
  },
  {
    id: "checklist",
    label: "Add Checklist",
    icon: ListChecks,
    prompt: "Add a compliance checklist at the end of this document summarizing key obligations and deadlines for each party.",
  },
  {
    id: "formalize",
    label: "Make Formal",
    icon: Languages,
    prompt: "Make this document more formal and professional, using appropriate legal terminology and structure.",
  },
];

export function AiAssistantPanel({
  documentId,
  getContent,
  setContent,
  onContentUpdated,
}: AiAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        content: "Analyzing your request and updating the document...",
        timestamp: new Date(),
        isStreaming: true,
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
                // Don't update message content during streaming - just accumulate
              }
              if (data.done) {
                // Update the editor with the new content
                setContent(fullContent);
                onContentUpdated?.();
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: "✓ Document updated successfully!", isStreaming: false }
                      : msg
                  )
                );
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Request cancelled.", isStreaming: false }
              : msg
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: "Sorry, something went wrong. Please try again.", isStreaming: false }
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-sm bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <SheetTitle className="text-base font-medium">AI Assistant</SheetTitle>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="h-7 px-2 text-xs text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleSubmit(action.prompt)}
                disabled={isProcessing}
                className="flex items-center gap-2 p-2 rounded-sm border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <action.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate">{action.label}</span>
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
                  Ask me to edit, improve, or modify your document. I can help with formatting, language, and content changes.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-1.5 rounded-sm bg-primary/10 h-fit shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-sm px-3 py-2 max-w-[85%] text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.isStreaming ? (
                      <ThinkingIndicator />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                        {message.content || (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing...
                          </span>
                        )}
                      </p>
                    )}
                    {message.role === "assistant" && message.content && !message.isStreaming && !message.content.startsWith("✓") && !message.content.includes("cancelled") && !message.content.includes("wrong") && (
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
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
                    <div className="p-1.5 rounded-sm bg-primary h-fit shrink-0">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
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
              className="min-h-[72px] resize-none text-sm rounded-sm"
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
              Press Enter to send, Shift+Enter for new line
            </p>
            {isProcessing ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                className="h-7 text-xs rounded-sm"
              >
                Cancel
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleSubmit()}
                disabled={!prompt.trim()}
                className="h-7 text-xs rounded-sm"
              >
                <Send className="h-3 w-3 mr-1" />
                Send
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
