"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  FileText,
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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

interface DocumentsResponse {
  documents: Document[];
}

async function fetchDocuments(): Promise<DocumentsResponse> {
  const response = await fetch("/api/documents");
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

export default function DocumentsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted", {
        description: "The document has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete document", {
        description: "Please try again.",
      });
    },
  });

  const documents = data?.documents || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "FINAL":
        return "text-green-600 bg-green-50 border-green-200";
      case "ARCHIVED":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleDeleteClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  const handleExport = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob(
      [
        `<html>
        <head><meta charset='utf-8'><title>${doc.title}</title></head>
        <body>${doc.content}</body>
        </html>`,
      ],
      { type: "application/msword" }
    );
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${doc.title || "document"}.doc`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Document exported", {
      description: "Your document has been downloaded.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-2">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to load documents</h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your documents.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold font-display">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>

        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Get started by generating your first AI-powered legal document"
          primaryAction={{
            label: "Generate Document",
            onClick: () => router.push("/create"),
          }}
          secondaryAction={null}
          showTemplates={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/create")}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Document
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="rounded-sm cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => router.push(`/documents/${doc.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`inline-flex items-center rounded-sm border px-2 py-1 text-xs font-medium ${getStatusColor(
                      doc.status,
                    )}`}
                  >
                    {doc.status}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/documents/${doc.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleExport(doc, e)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(doc, e)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardTitle className="text-base font-medium line-clamp-1 mt-3">
                {doc.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {doc.documentType} • {doc.jurisdiction}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {(() => {
                  let cleanText = doc.content || "";
                  cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
                  cleanText = cleanText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
                  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
                  cleanText = cleanText.replace(/`[^`]*`/g, "");
                  cleanText = cleanText.replace(/\b(?:body|html|h[1-6]|p|div|span|\.[\w-]+|#[\w-]+)\s*\{[^}]*\}/g, "");
                  cleanText = cleanText.replace(/\{[^}]*\}/g, "");
                  cleanText = cleanText.replace(/<[^>]*>/g, " ");
                  cleanText = cleanText.replace(/\s+/g, " ").trim();
                  const titleLower = doc.title.toLowerCase();
                  const cleanLower = cleanText.toLowerCase();
                  if (cleanLower.startsWith(titleLower)) {
                    cleanText = cleanText.substring(doc.title.length).trim();
                  }
                  if (!cleanText || cleanText.length === 0) {
                    return "No preview available";
                  }
                  return cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText;
                })()}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Document</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {documentToDelete?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDocumentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
