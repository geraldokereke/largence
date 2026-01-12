"use client";

import { useState, useEffect } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Download,
  Loader2,
  FileText,
  FileType2,
  FileCode,
  Cloud,
  ExternalLink,
} from "lucide-react";
import { SiGoogledrive, SiNotion, SiDropbox } from "react-icons/si";
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
  const [activeTab, setActiveTab] = useState("download");
  const [integrations, setIntegrations] = useState<{
    googleDrive: boolean;
    notion: boolean;
    dropbox: boolean;
  }>({ googleDrive: false, notion: false, dropbox: false });
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);

  // Fetch connected integrations
  useEffect(() => {
    if (open) {
      setIsLoadingIntegrations(true);
      fetch("/api/integrations")
        .then((res) => res.json())
        .then((data) => {
          const connected = data.integrations?.filter(
            (i: any) => i.status === "CONNECTED"
          );
          setIntegrations({
            googleDrive: connected?.some((i: any) => i.provider === "GOOGLE_DRIVE"),
            notion: connected?.some((i: any) => i.provider === "NOTION"),
            dropbox: connected?.some((i: any) => i.provider === "DROPBOX"),
          });
        })
        .catch(console.error)
        .finally(() => setIsLoadingIntegrations(false));
    }
  }, [open]);

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

  const handleExportToNotion = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/integrations/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const data = await response.json();
      toast.success("Document exported to Notion", {
        description: "Your document has been created as a Notion page.",
        action: data.page?.url
          ? {
              label: "Open",
              onClick: () => window.open(data.page.url, "_blank"),
            }
          : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting to Notion:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export to Notion"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToDropbox = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/integrations/dropbox/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          folderPath: "/Largence",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const data = await response.json();
      toast.success("Document exported to Dropbox", {
        description: `Saved as ${data.file?.name} in your Dropbox.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting to Dropbox:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export to Dropbox"
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
            Choose how to export &quot;{documentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="download" className="text-sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </TabsTrigger>
            <TabsTrigger value="cloud" className="text-sm">
              <Cloud className="h-3.5 w-3.5 mr-1.5" />
              Cloud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="mt-4">
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="space-y-2">
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
                      <CardContent className="flex items-center gap-3 p-3">
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="sr-only"
                        />
                        <div
                          className={`h-9 w-9 rounded-sm flex items-center justify-center ${
                            format === option.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">
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

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                Download
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="mt-4">
            <div className="space-y-2">
              {/* Google Drive - Coming Soon */}
              <Card className="opacity-60">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="h-9 w-9 rounded-sm bg-blue-500/10 flex items-center justify-center">
                    <SiGoogledrive className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Google Drive</p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Soon
                  </Button>
                </CardContent>
              </Card>

              {/* Notion */}
              <Card
                className={`transition-colors ${
                  integrations.notion
                    ? "hover:border-primary/50 cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="h-9 w-9 rounded-sm bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <SiNotion className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Notion</p>
                    <p className="text-xs text-muted-foreground">
                      {integrations.notion
                        ? "Create a Notion page"
                        : "Not connected"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={integrations.notion ? "default" : "outline"}
                    onClick={
                      integrations.notion
                        ? handleExportToNotion
                        : () => window.open("/integrations", "_blank")
                    }
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : integrations.notion ? (
                      <>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Export
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Dropbox */}
              <Card
                className={`transition-colors ${
                  integrations.dropbox
                    ? "hover:border-primary/50 cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="h-9 w-9 rounded-sm bg-blue-600/10 flex items-center justify-center">
                    <SiDropbox className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dropbox</p>
                    <p className="text-xs text-muted-foreground">
                      {integrations.dropbox
                        ? "Save to your Dropbox"
                        : "Not connected"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={integrations.dropbox ? "default" : "outline"}
                    onClick={
                      integrations.dropbox
                        ? handleExportToDropbox
                        : () => window.open("/integrations", "_blank")
                    }
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : integrations.dropbox ? (
                      <>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Export
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {!integrations.notion && !integrations.dropbox && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Connect your cloud accounts in{" "}
                <a
                  href="/integrations"
                  className="text-primary hover:underline"
                >
                  Integrations
                </a>{" "}
                to export directly.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
