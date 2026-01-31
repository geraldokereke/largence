"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { WelcomeCTA } from "@largence/components/welcome-cta";
import { QuickStats } from "@largence/components/quick-stats";
import { QuickActions } from "@largence/components/quick-actions";
import { EmptyState } from "@largence/components/empty-state";
import { Button } from "@largence/components/ui/button";
import { Skeleton } from "@largence/components/ui/skeleton";
import { FileText, AlertCircle, ArrowRight, RefreshCw, Clock, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface Document {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "FINAL" | "ARCHIVED";
  documentType: string;
  jurisdiction: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch("/api/documents");
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to login immediately if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace("/login");
    }
  }, [isLoaded, userId, router]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
    enabled: !!userId,
  });

  const documents = data?.documents || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900";
      case "FINAL":
        return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900";
      case "ARCHIVED":
        return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900/50 dark:border-slate-800";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900/50 dark:border-slate-800";
    }
  };

  // Show loading while checking auth
  if (!isLoaded || !userId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <WelcomeCTA />
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load documents</h2>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading your recent documents.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <WelcomeCTA />

      {isLoading ? (
        <div className="space-y-3">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-sm border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          {/* Cards skeleton */}
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-sm border bg-card p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-5 w-14 rounded-sm" />
                </div>
                <Skeleton className="h-3 w-32 mb-3" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Quick Stats */}
          <QuickStats documents={documents} />

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between">
            <QuickActions />
          </div>

          {/* Recent Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold font-display">
                Recent Documents
              </h2>
              <Button
                variant="ghost"
              onClick={() => router.push("/documents")}
              className="text-sm h-8"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {documents.slice(0, 8).map((doc) => (
              <div
                key={doc.id}
                className="group relative rounded-sm border bg-card p-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all flex flex-col h-full"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                {/* Quick action button - visible on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-sm shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/documents/${doc.id}`);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Header row - Title and Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5 pr-8">
                  <h3 className="text-sm font-medium line-clamp-1 flex-1 group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                </div>

                {/* Status badge below title */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0 ${getStatusColor(
                      doc.status,
                    )}`}
                  >
                    {doc.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Metadata row */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                  <span className="truncate">{doc.documentType}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="truncate">{doc.jurisdiction}</span>
                </div>

                {/* Content preview */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                  {(() => {
                    let cleanText = doc.content || "";
                    cleanText = cleanText.replace(
                      /<style[^>]*>[\s\S]*?<\/style>/gi,
                      "",
                    );
                    cleanText = cleanText.replace(
                      /<script[^>]*>[\s\S]*?<\/script>/gi,
                      "",
                    );
                    cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
                    cleanText = cleanText.replace(/`[^`]*`/g, "");
                    cleanText = cleanText.replace(
                      /\b(?:body|html|h[1-6]|p|div|span|\.[\w-]+|#[\w-]+)\s*\{[^}]*\}/g,
                      "",
                    );
                    cleanText = cleanText.replace(/\{[^}]*\}/g, "");
                    cleanText = cleanText.replace(/<[^>]*>/g, " ");
                    cleanText = cleanText.replace(/\s+/g, " ").trim();
                    const titleLower = doc.title.toLowerCase();
                    const cleanLower = cleanText.toLowerCase();
                    if (cleanLower.startsWith(titleLower)) {
                      cleanText = cleanText
                        .substring(doc.title.length)
                        .trim();
                    }
                    if (!cleanText || cleanText.length === 0) {
                      return "No preview available";
                    }
                    return cleanText.length > 100
                      ? cleanText.substring(0, 100) + "..."
                      : cleanText;
                  })()}
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
