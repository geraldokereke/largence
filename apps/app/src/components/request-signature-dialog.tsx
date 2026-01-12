"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Copy,
  Loader2,
  PenTool,
  Trash2,
  Check,
  Mail,
  Clock,
  User,
  Plus,
  ExternalLink,
  Send,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DocumentSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signerRole: string | null;
  status: string;
  signatureData: string | null;
  signatureType: string;
  signedAt: string | null;
  signOrder: number;
  accessToken: string;
  tokenExpiresAt: string;
  createdAt: string;
  signingUrl?: string;
}

interface RequestSignatureDialogProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  VIEWED: { label: "Viewed", color: "bg-blue-500" },
  SIGNED: { label: "Signed", color: "bg-green-500" },
  DECLINED: { label: "Declined", color: "bg-red-500" },
  EXPIRED: { label: "Expired", color: "bg-gray-500" },
};

export function RequestSignatureDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: RequestSignatureDialogProps) {
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingSignature, setViewingSignature] = useState<DocumentSignature | null>(null);

  // New signer form state
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerRole, setSignerRole] = useState("");

  useEffect(() => {
    if (open) {
      fetchSignatures();
    }
  }, [open, documentId]);

  const fetchSignatures = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/signatures`);
      if (response.ok) {
        const data = await response.json();
        setSignatures(data);
      }
    } catch (error) {
      console.error("Error fetching signatures:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSignerName("");
    setSignerEmail("");
    setSignerRole("");
  };

  const handleAddSigner = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signerEmail: signerEmail.trim(),
          signerRole: signerRole.trim() || null,
          signOrder: signatures.length + 1,
        }),
      });

      if (response.ok) {
        const newSignature = await response.json();
        setSignatures([...signatures, newSignature]);
        toast.success("Signer added");
        resetForm();

        // Copy the signing URL
        if (newSignature.signingUrl) {
          navigator.clipboard.writeText(newSignature.signingUrl);
          setCopiedId(newSignature.id);
          setTimeout(() => setCopiedId(null), 2000);
          toast.success("Signing link copied to clipboard");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add signer");
      }
    } catch (error) {
      console.error("Error adding signer:", error);
      toast.error("Failed to add signer");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSigner = async (signatureId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/signatures/${signatureId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setSignatures(signatures.filter((s) => s.id !== signatureId));
        toast.success("Signer removed");
      } else {
        toast.error("Failed to remove signer");
      }
    } catch (error) {
      console.error("Error deleting signer:", error);
      toast.error("Failed to remove signer");
    }
  };

  const copySigningUrl = (signature: DocumentSignature) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/sign/${signature.accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(signature.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Signing link copied");
  };

  const sendReminderEmail = (signature: DocumentSignature) => {
    // Open mailto link with pre-filled content
    const subject = encodeURIComponent(`Please sign: ${documentTitle}`);
    const baseUrl = window.location.origin;
    const signingUrl = `${baseUrl}/sign/${signature.accessToken}`;
    const body = encodeURIComponent(
      `Hi ${signature.signerName},\n\nYou have been requested to sign the document "${documentTitle}".\n\nPlease click the link below to review and sign:\n${signingUrl}\n\nThank you!`
    );
    window.open(`mailto:${signature.signerEmail}?subject=${subject}&body=${body}`);
  };

  const signedCount = signatures.filter((s) => s.status === "SIGNED").length;
  const totalSigners = signatures.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Request Signatures
          </DialogTitle>
          <DialogDescription>
            Add signers for &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          {signatures.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Signature Progress</span>
                  <span className="font-medium">
                    {signedCount} of {totalSigners} signed
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add New Signer */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-medium">Add Signer</h4>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signer-name">Name *</Label>
                  <Input
                    id="signer-name"
                    placeholder="John Smith"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer-role">Role (optional)</Label>
                  <Input
                    id="signer-role"
                    placeholder="e.g., Party A, Witness"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signer-email">Email *</Label>
                <Input
                  id="signer-email"
                  type="email"
                  placeholder="john@example.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleAddSigner}
              disabled={isCreating || !signerName.trim() || !signerEmail.trim()}
              className="w-full"
            >
              Add Signer
              {isCreating ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {/* Existing Signers */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Signers ({signatures.length})
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : signatures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No signers added yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {signatures.map((signature, index) => (
                  <div
                    key={signature.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {signature.signerName}
                          </p>
                          {signature.signerRole && (
                            <Badge variant="outline" className="text-xs">
                              {signature.signerRole}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {signature.signerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className={`${STATUS_CONFIG[signature.status]?.color || "bg-gray-500"} text-white text-xs`}
                      >
                        {STATUS_CONFIG[signature.status]?.label || signature.status}
                      </Badge>

                      {signature.status !== "SIGNED" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copySigningUrl(signature)}
                            title="Copy signing link"
                          >
                            {copiedId === signature.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => sendReminderEmail(signature)}
                            title="Send reminder email"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSigner(signature.id)}
                            title="Remove signer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {signature.status === "SIGNED" && signature.signedAt && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingSignature(signature)}
                            title="View signature"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(signature.signedAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View Signature Modal */}
          {viewingSignature && viewingSignature.signatureData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingSignature(null)}>
              <div 
                className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Signature from {viewingSignature.signerName}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setViewingSignature(null)}>
                    ✕
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <img 
                    src={viewingSignature.signatureData} 
                    alt={`Signature by ${viewingSignature.signerName}`}
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> {viewingSignature.signerEmail}</p>
                  {viewingSignature.signerRole && (
                    <p><strong>Role:</strong> {viewingSignature.signerRole}</p>
                  )}
                  <p><strong>Type:</strong> {viewingSignature.signatureType === "DRAW" ? "Hand-drawn" : viewingSignature.signatureType === "TYPE" ? "Typed" : "Uploaded"}</p>
                  {viewingSignature.signedAt && (
                    <p><strong>Signed:</strong> {format(new Date(viewingSignature.signedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                  )}
                </div>
              </div>
            </div>
          )}
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
