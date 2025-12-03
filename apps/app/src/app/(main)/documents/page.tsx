"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

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

export default function DocumentsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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
        <Button onClick={() => router.push("/create")}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Document
        </Button>
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
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement download
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
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

                  // Remove style tags and their content
                  cleanText = cleanText.replace(
                    /<style[^>]*>[\s\S]*?<\/style>/gi,
                    "",
                  );

                  // Remove script tags and their content
                  cleanText = cleanText.replace(
                    /<script[^>]*>[\s\S]*?<\/script>/gi,
                    "",
                  );

                  // Remove markdown code blocks
                  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");

                  // Remove inline code backticks
                  cleanText = cleanText.replace(/`[^`]*`/g, "");

                  // Remove CSS selectors and rules (body, h1, .class, etc.)
                  cleanText = cleanText.replace(
                    /\b(?:body|html|h[1-6]|p|div|span|\.[\w-]+|#[\w-]+)\s*\{[^}]*\}/g,
                    "",
                  );

                  // Remove JSON-like content
                  cleanText = cleanText.replace(/\{[^}]*\}/g, "");

                  // Remove all HTML tags
                  cleanText = cleanText.replace(/<[^>]*>/g, " ");

                  // Remove extra whitespace, newlines, and normalize spaces
                  cleanText = cleanText.replace(/\s+/g, " ").trim();

                  // Remove the title if it appears at the start
                  const titleLower = doc.title.toLowerCase();
                  const cleanLower = cleanText.toLowerCase();
                  if (cleanLower.startsWith(titleLower)) {
                    cleanText = cleanText.substring(doc.title.length).trim();
                  }

                  // If still no content, return placeholder
                  if (!cleanText || cleanText.length === 0) {
                    return "No preview available";
                  }

                  // Return truncated text with ellipsis
                  return cleanText.length > 120
                    ? cleanText.substring(0, 120) + "..."
                    : cleanText;
                })()}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated{" "}
                {formatDistanceToNow(new Date(doc.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
