"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Loader2,
  FileText,
  FileType2,
  FileCode,
  Cloud,
  ExternalLink,
  Check,
  ChevronLeft,
} from "lucide-react";
import { SiGoogledrive, SiNotion, SiDropbox } from "react-icons/si";
import { toast } from "sonner";

interface NotionPage {
  id: string;
  object: string;
  title: string;
  url: string;
}

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
    color: "bg-red-500/10 text-red-600",
  },
  {
    value: "docx",
    label: "Word Document",
    description: "Editable Microsoft Word format",
    icon: FileType2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    value: "html",
    label: "HTML",
    description: "Web page format",
    icon: FileCode,
    color: "bg-orange-500/10 text-orange-600",
  },
];

const CLOUD_INTEGRATIONS = [
  {
    provider: "GOOGLE_DRIVE",
    label: "Google Drive",
    description: "Sync to your Google Drive",
    icon: SiGoogledrive,
    color: "bg-blue-500/10 text-blue-500",
    comingSoon: true,
  },
  {
    provider: "NOTION",
    label: "Notion",
    description: "Create a Notion page",
    icon: SiNotion,
    color: "bg-black/5 dark:bg-white/10 text-black dark:text-white",
    comingSoon: false,
  },
  {
    provider: "DROPBOX",
    label: "Dropbox",
    description: "Save to your Dropbox",
    icon: SiDropbox,
    color: "bg-blue-600/10 text-blue-600",
    comingSoon: false,
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
  const [exportingTo, setExportingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("download");
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    GOOGLE_DRIVE: false,
    NOTION: false,
    DROPBOX: false,
  });
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  
  // Notion page picker state
  const [showNotionPicker, setShowNotionPicker] = useState(false);
  const [notionPages, setNotionPages] = useState<NotionPage[]>([]);
  const [selectedNotionPage, setSelectedNotionPage] = useState<string>("");
  const [isLoadingNotionPages, setIsLoadingNotionPages] = useState(false);

  // Fetch connected integrations
  useEffect(() => {
    if (open) {
      setIsLoadingIntegrations(true);
      setShowNotionPicker(false);
      setSelectedNotionPage("");
      fetch("/api/integrations")
        .then((res) => res.json())
        .then((data) => {
          const connected = data.integrations?.filter(
            (i: any) => i.status === "CONNECTED"
          );
          setIntegrations({
            GOOGLE_DRIVE: connected?.some((i: any) => i.provider === "GOOGLE_DRIVE"),
            NOTION: connected?.some((i: any) => i.provider === "NOTION"),
            DROPBOX: connected?.some((i: any) => i.provider === "DROPBOX"),
          });
        })
        .catch(console.error)
        .finally(() => setIsLoadingIntegrations(false));
    }
  }, [open]);

  // Fetch Notion pages when picker is shown
  const fetchNotionPages = async () => {
    setIsLoadingNotionPages(true);
    try {
      const response = await fetch("/api/integrations/notion/sync?type=pages");
      if (!response.ok) {
        throw new Error("Failed to fetch Notion pages");
      }
      const data = await response.json();
      setNotionPages(data.items || []);
    } catch (error) {
      console.error("Error fetching Notion pages:", error);
      toast.error("Failed to load Notion pages");
    } finally {
      setIsLoadingNotionPages(false);
    }
  };

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
    if (!selectedNotionPage) {
      // Show the Notion picker first
      setShowNotionPicker(true);
      fetchNotionPages();
      return;
    }
    
    setExportingTo("NOTION");
    try {
      // If __workspace__ is selected, don't send parentPageId - API will create at workspace level
      const requestBody: Record<string, string> = { documentId };
      if (selectedNotionPage !== "__workspace__") {
        requestBody.parentPageId = selectedNotionPage;
      }
      
      const response = await fetch("/api/integrations/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const data = await response.json();
      toast.success("Document exported to Notion", {
        description: selectedNotionPage === "__workspace__" 
          ? "Your document has been created as a private page in Notion."
          : "Your document has been created as a Notion page.",
        action: data.page?.url
          ? {
              label: "Open",
              onClick: () => window.open(data.page.url, "_blank"),
            }
          : undefined,
      });
      setShowNotionPicker(false);
      setSelectedNotionPage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting to Notion:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export to Notion"
      );
    } finally {
      setExportingTo(null);
    }
  };

  const handleExportToDropbox = async () => {
    setExportingTo("DROPBOX");
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
      setExportingTo(null);
    }
  };

  const handleCloudExport = (provider: string) => {
    if (provider === "NOTION") {
      handleExportToNotion();
    } else if (provider === "DROPBOX") {
      handleExportToDropbox();
    }
  };

  // Show Notion page picker
  if (showNotionPicker) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setShowNotionPicker(false);
          setSelectedNotionPage("");
        }
        onOpenChange(isOpen);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowNotionPicker(false);
                  setSelectedNotionPage("");
                }}
                className="p-1 -ml-1 hover:bg-muted rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <SiNotion className="h-5 w-5" />
              Export to Notion
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              Choose where to create <span className="font-medium truncate max-w-[180px] inline-block" title={documentTitle}>&quot;{documentTitle}&quot;</span> in Notion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Option 1: Create as private page */}
            <button
              type="button"
              onClick={() => {
                setSelectedNotionPage("__workspace__");
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedNotionPage === "__workspace__"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
              }`}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-black/5 dark:bg-white/10">
                <SiNotion className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Create as private page</p>
                <p className="text-xs text-muted-foreground">
                  Creates a new private page in your Notion workspace
                </p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedNotionPage === "__workspace__"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                }`}
              >
                {selectedNotionPage === "__workspace__" && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or add to existing page
                </span>
              </div>
            </div>

            {/* Option 2: Select existing page */}
            {isLoadingNotionPages ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notionPages.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">
                  No shared pages found. Share a Notion page with Largence to add content to it.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Select 
                  value={selectedNotionPage === "__workspace__" ? "" : selectedNotionPage} 
                  onValueChange={setSelectedNotionPage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page..." />
                  </SelectTrigger>
                  <SelectContent>
                    {notionPages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title || "Untitled"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNotionPicker(false);
                setSelectedNotionPage("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExportToNotion}
              disabled={!selectedNotionPage || exportingTo === "NOTION"}
            >
              {exportingTo === "NOTION" ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              )}
              Export to Notion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Document
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            Choose how to export <span className="font-medium truncate max-w-[200px] inline-block" title={documentTitle}>&quot;{documentTitle}&quot;</span>
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
            <div className="space-y-2">
              {EXPORT_FORMATS.map((option) => {
                const isSelected = format === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center ${option.color}`}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

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
                Download {format.toUpperCase()}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="mt-4">
            <div className="space-y-2">
              {CLOUD_INTEGRATIONS.map((integration) => {
                const isConnected = integrations[integration.provider];
                const isExportingThis = exportingTo === integration.provider;
                const Icon = integration.icon;

                return (
                  <button
                    key={integration.provider}
                    type="button"
                    onClick={() => {
                      if (integration.comingSoon) return;
                      if (isConnected) {
                        handleCloudExport(integration.provider);
                      } else {
                        window.open("/integrations", "_blank");
                      }
                    }}
                    disabled={integration.comingSoon || isExportingThis}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      integration.comingSoon
                        ? "opacity-50 cursor-not-allowed border-border"
                        : isConnected
                          ? "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                          : "border-border hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center ${integration.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{integration.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.comingSoon
                          ? "Coming soon"
                          : isConnected
                            ? integration.description
                            : "Not connected"}
                      </p>
                    </div>
                    <div>
                      {integration.comingSoon ? (
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted">
                          Soon
                        </span>
                      ) : isExportingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : isConnected ? (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Export
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted hover:bg-muted/80">
                          Connect
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!integrations.NOTION && !integrations.DROPBOX && (
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
