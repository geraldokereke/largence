"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { WelcomeCTA } from "@largence/components/welcome-cta";
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
import { FileText, Sparkles, ArrowRight } from "lucide-react";
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

export default function Home() {
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <WelcomeCTA />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
      ) : documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display">
              Recent Documents
            </h2>
            <Button
              variant="ghost"
              onClick={() => router.push("/documents")}
              className="text-sm"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 6).map((doc) => (
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
                    <div
                      className={`inline-flex items-center rounded-sm border px-2 py-1 text-xs font-medium ${getStatusColor(
                        doc.status,
                      )}`}
                    >
                      {doc.status}
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
      )}
    </div>
  );
}
