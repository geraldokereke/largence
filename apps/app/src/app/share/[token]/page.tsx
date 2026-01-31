"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { 
  Loader2, 
  Lock, 
  FileText, 
  Eye, 
  AlertCircle, 
  Edit,
  Save,
  MessageSquare,
  PenTool,
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Separator } from "@/components/ui/separator";

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
  shareId: string;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedDoc, setSharedDoc] = useState<SharedDocument | null>(null);
  const [saving, setSaving] = useState(false);

  const canEdit = sharedDoc?.permission === "EDIT";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TipTapLink.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Document content...",
      }),
    ],
    content: "",
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-base sm:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px]",
      },
    },
  });

  // Update editor content and editability when sharedDoc changes
  useEffect(() => {
    if (editor && sharedDoc) {
      editor.commands.setContent(sharedDoc.document.content || "");
      editor.setEditable(canEdit);
    }
  }, [editor, sharedDoc, canEdit]);

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

  const handleSave = useCallback(async () => {
    if (!editor || !sharedDoc || !canEdit) return;

    setSaving(true);
    try {
      const content = editor.getHTML();
      const response = await fetch(`/api/share/${token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const data = await response.json();
        setSharedDoc((prev) => prev ? {
          ...prev,
          document: { ...prev.document, content, updatedAt: data.updatedAt },
        } : null);
        toast.success("Document saved", {
          description: "Your changes have been saved successfully.",
        });
      } else {
        const errorData = await response.json();
        toast.error("Failed to save", {
          description: errorData.error || "Could not save your changes.",
        });
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save", {
        description: "An error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  }, [editor, sharedDoc, canEdit, token]);

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

  const permissionConfig = {
    VIEW: { label: "View Only", icon: Eye, color: "text-muted-foreground" },
    COMMENT: { label: "Can Comment", icon: MessageSquare, color: "text-blue-500" },
    EDIT: { label: "Can Edit", icon: Edit, color: "text-green-500" },
    SIGN: { label: "Can Sign", icon: PenTool, color: "text-purple-500" },
  }[sharedDoc.permission] || { label: sharedDoc.permission, icon: Eye, color: "text-muted-foreground" };

  const PermissionIcon = permissionConfig.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold truncate">{sharedDoc.document.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Shared {format(new Date(sharedDoc.sharedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className={permissionConfig.color}>
                <PermissionIcon className="h-3 w-3 mr-1" />
                {permissionConfig.label}
              </Badge>
              {canEdit && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Editor Toolbar - Only show for EDIT permission */}
        {canEdit && editor && (
          <div className="border-t bg-muted/30 px-4 py-2 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {/* Undo/Redo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                className="h-8 w-8 p-0"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                className="h-8 w-8 p-0"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Text Formatting */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-muted" : ""}`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-muted" : ""}`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`h-8 w-8 p-0 ${editor.isActive("underline") ? "bg-muted" : ""}`}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Alignment */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}`}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}`}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}`}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Lists */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-muted" : ""}`}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Message from sender */}
      {sharedDoc.message && (
        <div className="container mx-auto px-4 py-4 shrink-0">
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
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <Card className="min-h-[calc(100vh-250px)]">
            <CardContent className="p-6 sm:p-8">
              {canEdit && editor ? (
                <EditorContent editor={editor} />
              ) : (
                <div
                  className="prose prose-base sm:prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sharedDoc.document.content }}
                />
              )}
            </CardContent>
          </Card>

          {/* Footer info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Last updated:{" "}
              {format(new Date(sharedDoc.document.updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
