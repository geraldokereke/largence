"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  Link,
  Loader2,
  Mail,
  Trash2,
  Check,
  Eye,
  Edit,
  MessageSquare,
  PenTool,
  Calendar,
  Lock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DocumentShare {
  id: string;
  sharedWithEmail: string | null;
  permission: string;
  accessToken: string;
  password: string | null;
  expiresAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  message: string | null;
  createdAt: string;
  shareUrl?: string;
}

interface ShareDocumentDialogProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERMISSIONS = [
  { value: "VIEW", label: "View Only", icon: Eye, description: "Can only view the document" },
  { value: "COMMENT", label: "Comment", icon: MessageSquare, description: "Can view and add comments" },
  { value: "EDIT", label: "Edit", icon: Edit, description: "Can make changes to the document" },
  { value: "SIGN", label: "Sign", icon: PenTool, description: "Can sign the document" },
];

export function ShareDocumentDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: ShareDocumentDialogProps) {
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New share form state
  const [sharedWithEmail, setSharedWithEmail] = useState("");
  const [permission, setPermission] = useState("VIEW");
  const [message, setMessage] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open, documentId]);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error("Error fetching shares:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSharedWithEmail("");
    setPermission("VIEW");
    setMessage("");
    setHasExpiry(false);
    setExpiresAt("");
    setHasPassword(false);
    setPassword("");
  };

  const handleCreateShare = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sharedWithEmail: sharedWithEmail || null,
          permission,
          message: message || null,
          expiresAt: hasExpiry && expiresAt ? expiresAt : null,
          password: hasPassword && password ? password : null,
        }),
      });

      if (response.ok) {
        const newShare = await response.json();
        setShares([newShare, ...shares]);
        toast.success("Share link created");
        resetForm();
        
        // Auto-copy the share URL
        if (newShare.shareUrl) {
          navigator.clipboard.writeText(newShare.shareUrl);
          setCopiedId(newShare.id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create share");
      }
    } catch (error) {
      console.error("Error creating share:", error);
      toast.error("Failed to create share");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/share/${shareId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setShares(shares.filter((s) => s.id !== shareId));
        toast.success("Share link revoked");
      } else {
        toast.error("Failed to revoke share");
      }
    } catch (error) {
      console.error("Error deleting share:", error);
      toast.error("Failed to revoke share");
    }
  };

  const copyShareUrl = (share: DocumentShare) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/share/${share.accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied to clipboard");
  };

  const getPermissionIcon = (perm: string) => {
    const config = PERMISSIONS.find((p) => p.value === perm);
    const Icon = config?.icon || Eye;
    return <Icon className="h-3 w-3" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Create share links for &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Share */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-medium">Create New Share Link</h4>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={sharedWithEmail}
                  onChange={(e) => setSharedWithEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for a general share link
                </p>
              </div>

              <div className="space-y-2">
                <Label>Permission</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSIONS.map((perm) => (
                      <SelectItem key={perm.value} value={perm.value}>
                        <div className="flex items-center gap-2">
                          <perm.icon className="h-4 w-4" />
                          <span>{perm.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message for the recipient..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="expiry" className="font-normal">
                    Set expiration date
                  </Label>
                </div>
                <Switch
                  id="expiry"
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                />
              </div>

              {hasExpiry && (
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="password-toggle" className="font-normal">
                    Password protect
                  </Label>
                </div>
                <Switch
                  id="password-toggle"
                  checked={hasPassword}
                  onCheckedChange={setHasPassword}
                />
              </div>

              {hasPassword && (
                <Input
                  type="text"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={isCreating}
              className="w-full"
            >
              Create Share Link
              {isCreating ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Existing Shares */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Active Share Links ({shares.length})
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No active share links
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {share.sharedWithEmail ? (
                          <Mail className="h-4 w-4 text-primary" />
                        ) : (
                          <Link className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {share.sharedWithEmail || "Anyone with link"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5 gap-1">
                            {getPermissionIcon(share.permission)}
                            {share.permission}
                          </Badge>
                          <span>•</span>
                          <span>{share.viewCount} views</span>
                          {share.expiresAt && (
                            <>
                              <span>•</span>
                              <span>
                                Expires{" "}
                                {format(new Date(share.expiresAt), "MMM d")}
                              </span>
                            </>
                          )}
                          {share.password && (
                            <>
                              <span>•</span>
                              <Lock className="h-3 w-3" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyShareUrl(share)}
                      >
                        {copiedId === share.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          window.open(`/share/${share.accessToken}`, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteShare(share.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
