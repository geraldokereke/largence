"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, FileText, Eye, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface SharedDocument {
  document: {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  permission: string;
  message: string | null;
  sharedAt: string;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedDoc, setSharedDoc] = useState<SharedDocument | null>(null);

  const fetchDocument = async (pwd?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = pwd
        ? `/api/share/${token}?password=${encodeURIComponent(pwd)}`
        : `/api/share/${token}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setSharedDoc(data);
        setRequiresPassword(false);
      } else if (response.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
      } else if (response.status === 410) {
        setError("This share link has expired.");
      } else if (response.status === 404) {
        setError("Share link not found or has been revoked.");
      } else {
        setError(data.error || "Failed to access document.");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to access document.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsSubmitting(true);
    fetchDocument(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Unable to Access Document</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact the person who
              shared this document with you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Password Required</CardTitle>
            <CardDescription>
              This document is protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !password.trim()}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Access Document
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedDoc) {
    return null;
  }

  const permissionLabel = {
    VIEW: "View Only",
    COMMENT: "Can Comment",
    EDIT: "Can Edit",
    SIGN: "Can Sign",
  }[sharedDoc.permission] || sharedDoc.permission;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">{sharedDoc.document.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Shared {format(new Date(sharedDoc.sharedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                {permissionLabel}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Message from sender */}
      {sharedDoc.message && (
        <div className="container mx-auto px-4 py-4">
          <Card className="bg-muted/50">
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground">
                <strong>Message:</strong> {sharedDoc.message}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Content */}
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sharedDoc.document.content }}
            />
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Last updated:{" "}
            {format(new Date(sharedDoc.document.updatedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </main>
    </div>
  );
}
