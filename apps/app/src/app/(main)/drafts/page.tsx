"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@largence/components/empty-state";
import { Button } from "@largence/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@largence/components/ui/card";
import { Skeleton } from "@largence/components/ui/skeleton";
import { Badge } from "@largence/components/ui/badge";
import {
  Brain,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@largence/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Draft {
  id: string;
  title: string;
  content: string;
  status: string;
  documentType: string;
  jurisdiction: string;
  aiModel?: string;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchDrafts(): Promise<{ drafts: Draft[] }> {
  const response = await fetch("/api/documents/drafts");
  if (!response.ok) throw new Error("Failed to fetch drafts");
  return response.json();
}

async function deleteDraft(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete draft");
}

export default function DraftsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["drafts"],
    queryFn: fetchDrafts,
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Draft deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete draft");
    },
  });

  const drafts = data?.drafts || [];

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const getPreviewText = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mb-1">
          <Skeleton className="h-6 w-36 mb-1" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-sm">
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mb-1">
          <h1 className="text-xl font-semibold font-display">AI Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your AI-generated document drafts
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load drafts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading your drafts.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mb-1">
          <h1 className="text-xl font-semibold font-display">AI Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your AI-generated document drafts
          </p>
        </div>

        <EmptyState
          icon={Brain}
          title="No AI drafts yet"
          description="Start generating legal documents with AI assistance. Your drafts will appear here for review and editing."
          primaryAction={{
            label: "Start AI Generation",
            onClick: () => router.push("/create"),
          }}
          secondaryAction={null}
          showTemplates={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold font-display">AI Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your AI-generated document drafts ({drafts.length}{" "}
            {drafts.length === 1 ? "draft" : "drafts"})
          </p>
        </div>
        <Button onClick={() => router.push("/create")} className="rounded-sm">
          <Sparkles className="h-4 w-4 mr-2" />
          New Draft
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <Card
            key={draft.id}
            className="rounded-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => router.push(`/documents/${draft.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  >
                    Draft
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/documents/${draft.id}`);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/preview/${draft.id}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => handleDelete(draft.id, e)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-base font-medium line-clamp-2 mt-2">
                {draft.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <FileText className="h-3 w-3" />
                {formatDocumentType(draft.documentType)}
                {draft.jurisdiction && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    {draft.jurisdiction}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {getPreviewText(draft.content)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(draft.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {draft.aiModel && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{draft.aiModel}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
