"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  Send,
  Mail,
  User,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  FileSignature,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Signer {
  email: string;
  name: string;
}

interface Envelope {
  envelopeId: string;
  status: string;
  statusChangedDateTime?: string;
  emailSubject?: string;
  recipients?: {
    signers?: Array<{
      email: string;
      name: string;
      status: string;
      signedDateTime?: string;
    }>;
  };
}

interface DocuSignSignatureDialogProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocuSignSignatureDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: DocuSignSignatureDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [showNotConnected, setShowNotConnected] = useState(false);

  // Signer form state
  const [signers, setSigners] = useState<Signer[]>([{ email: "", name: "" }]);
  const [subject, setSubject] = useState(`Please sign: ${documentTitle}`);
  const [message, setMessage] = useState(
    `Please review and sign this document: ${documentTitle}`
  );

  useEffect(() => {
    if (open) {
      checkConnection();
      setSubject(`Please sign: ${documentTitle}`);
      setMessage(`Please review and sign this document: ${documentTitle}`);
    }
  }, [open, documentTitle]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations");
      if (response.ok) {
        const data = await response.json();
        const docusign = data.integrations?.find(
          (i: { provider: string; status: string }) =>
            i.provider === "DOCUSIGN" && i.status === "CONNECTED"
        );
        setIsConnected(!!docusign);

        if (docusign) {
          // Fetch recent envelopes for this document
          fetchEnvelopes();
        }
      }
    } catch (error) {
      console.error("Error checking DocuSign connection:", error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvelopes = async () => {
    try {
      const response = await fetch("/api/integrations/docusign/sync");
      if (response.ok) {
        const data = await response.json();
        setEnvelopes(data.envelopes || []);
      }
    } catch (error) {
      console.error("Error fetching envelopes:", error);
    }
  };

  const handleAddSigner = () => {
    setSigners([...signers, { email: "", name: "" }]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const handleSignerChange = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    const newSigners = [...signers];
    newSigners[index][field] = value;
    setSigners(newSigners);
  };

  const handleSend = async () => {
    // Validate signers
    const validSigners = signers.filter(
      (s) => s.email.trim() && s.name.trim()
    );
    if (validSigners.length === 0) {
      toast.error("Please add at least one signer with name and email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const signer of validSigners) {
      if (!emailRegex.test(signer.email)) {
        toast.error(`Invalid email: ${signer.email}`);
        return;
      }
    }

    setSending(true);
    try {
      const response = await fetch("/api/integrations/docusign/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signers: validSigners,
          subject,
          message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Signature request sent!", {
          description: `Document sent to ${validSigners.length} recipient(s) via DocuSign`,
        });
        // Reset form
        setSigners([{ email: "", name: "" }]);
        // Refresh envelopes list
        fetchEnvelopes();
      } else if (response.status === 400) {
        const error = await response.json();
        if (error.error?.includes("not connected")) {
          setShowNotConnected(true);
        } else {
          toast.error(error.error || "Failed to send signature request");
        }
      } else if (response.status === 401) {
        setShowNotConnected(true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send signature request");
      }
    } catch (error) {
      console.error("Error sending signature request:", error);
      toast.error("Failed to send signature request");
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "sent":
        return "bg-blue-500";
      case "delivered":
        return "bg-indigo-500";
      case "declined":
        return "bg-red-500";
      case "voided":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "sent":
      case "delivered":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "declined":
      case "voided":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isConnected === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-[#FF3B2F]" />
              Connect DocuSign
            </DialogTitle>
            <DialogDescription>
              Connect your DocuSign account to send documents for electronic
              signature.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <FileSignature className="h-8 w-8 text-[#FF3B2F]" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              DocuSign is not connected yet. Connect your account to start
              sending documents for signature.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => (window.location.href = "/integrations")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Go to Integrations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-[#FF3B2F]" />
              Send for Signature
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1 flex-wrap">
              <span>Send</span>
              <span className="font-medium truncate max-w-[200px] inline-block" title={documentTitle}>
                &ldquo;{documentTitle}&rdquo;
              </span>
              <span>to recipients via DocuSign for electronic signature.</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Document Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{documentTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Will be sent as a DOCX document
                </p>
              </div>
            </div>

            {/* Signers */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Recipients
              </Label>
              {signers.map((signer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={signer.name}
                    onChange={(e) =>
                      handleSignerChange(index, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signer.email}
                    onChange={(e) =>
                      handleSignerChange(index, "email", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSigner(index)}
                    disabled={signers.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSigner}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Recipient
              </Button>
            </div>

            {/* Email Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message to Recipients</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message for the recipients"
                rows={3}
              />
            </div>

            {/* Recent Envelopes */}
            {envelopes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Recent Signature Requests
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchEnvelopes}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {envelopes.slice(0, 5).map((envelope) => (
                    <div
                      key={envelope.envelopeId}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg text-sm"
                    >
                      {getStatusIcon(envelope.status)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">
                          {envelope.emailSubject || "Signature Request"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {envelope.statusChangedDateTime
                            ? format(
                                new Date(envelope.statusChangedDateTime),
                                "MMM d, yyyy 'at' h:mm a"
                              )
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(envelope.status)} text-white text-xs`}
                      >
                        {envelope.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending}
              className="gap-2 bg-[#FF3B2F] hover:bg-[#E5352B]"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send for Signature
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Not Connected Alert */}
      <Dialog open={showNotConnected} onOpenChange={setShowNotConnected}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              DocuSign Connection Required
            </DialogTitle>
            <DialogDescription>
              Your DocuSign connection has expired or is not configured. Please
              reconnect your DocuSign account to continue sending documents for
              signature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotConnected(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => (window.location.href = "/integrations")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Integrations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
