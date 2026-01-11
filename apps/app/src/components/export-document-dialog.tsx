"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Download,
  Loader2,
  FileText,
  FileType2,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

interface ExportDocumentDialogProps {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPORT_FORMATS = [
  {
    value: "pdf",
    label: "PDF",
    description: "Print-ready document format",
    icon: FileText,
  },
  {
    value: "docx",
    label: "Word Document",
    description: "Editable Microsoft Word format",
    icon: FileType2,
  },
  {
    value: "html",
    label: "HTML",
    description: "Web page format",
    icon: FileCode,
  },
];

export function ExportDocumentDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
}: ExportDocumentDialogProps) {
  const [format, setFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/documents/${documentId}/export?format=${format}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${documentTitle}.${format === "docx" ? "doc" : format}`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Document exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export document"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Document
          </DialogTitle>
          <DialogDescription>
            Choose a format to export &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={format} onValueChange={setFormat}>
            <div className="space-y-3">
              {EXPORT_FORMATS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="cursor-pointer"
                >
                  <Card
                    className={`transition-colors ${
                      format === option.value
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                      />
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          format === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <option.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          format === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {format === option.value && (
                          <div className="h-full w-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
