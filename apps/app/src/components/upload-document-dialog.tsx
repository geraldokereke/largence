"use client";

import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { Button } from "@largence/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { Upload, FileText, X, Loader2 } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "OTHER", label: "General Document" },
  { value: "NDA", label: "NDA" },
  { value: "CONTRACT", label: "Contract" },
  { value: "AGREEMENT", label: "Agreement" },
  { value: "POLICY", label: "Policy" },
  { value: "REPORT", label: "Report" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "INVOICE", label: "Invoice" },
  { value: "TERMS", label: "Terms & Conditions" },
  { value: "PRIVACY", label: "Privacy Policy" },
];

const ACCEPTED = ".pdf,.docx,.doc,.txt,.md,.html,.htm";
const MAX_MB = 10;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If true, navigates to the new document after upload */
  navigateOnSuccess?: boolean;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  navigateOnSuccess = false,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("OTHER");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const reset = () => {
    setFile(null);
    setDocumentType("OTHER");
    setIsDragging(false);
  };

  const handleClose = (val: boolean) => {
    if (!isUploading) {
      if (!val) reset();
      onOpenChange(val);
    }
  };

  const pickFile = (picked: File) => {
    const ext = picked.name.split(".").pop()?.toLowerCase() ?? "";
    const supported = ["pdf", "docx", "doc", "txt", "md", "html", "htm"];
    if (!supported.includes(ext)) {
      toast.error("Unsupported file type", {
        description: "Please upload a PDF, DOCX, DOC, TXT, MD, or HTML file.",
      });
      return;
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large`, { description: `Maximum size is ${MAX_MB} MB.` });
      return;
    }
    setFile(picked);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) pickFile(picked);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const picked = e.dataTransfer.files?.[0];
    if (picked) pickFile(picked);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Upload failed", { description: data.error || "Please try again." });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded", {
        description: `"${data.document.title}" has been added to your documents.`,
      });

      handleClose(false);

      if (navigateOnSuccess && data.document?.id) {
        router.push(`/documents/${data.document.id}`);
      }
    } catch {
      toast.error("Upload failed", { description: "An unexpected error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a file from your computer. Supported: PDF, DOCX, DOC, TXT, MD, HTML (max {MAX_MB} MB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed p-8 cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            }`}
            onClick={() => !file && inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={onFileChange}
            />

            {file ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drop your file here, or{" "}
                    <span className="text-primary underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, DOC, TXT, MD, HTML · up to {MAX_MB} MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Document type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Document type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="h-9 rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              className="rounded-sm"
              onClick={() => handleClose(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              className="rounded-sm"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
