"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import { Button } from "@largence/components/ui/button";
import { ScrollArea } from "@largence/components/ui/scroll-area";
import {
  Loader2,
  FolderIcon,
  FileText,
  ChevronRight,
  ArrowLeft,
  Download,
  AlertCircle,
  Cloud,
} from "lucide-react";
import { SiDropbox, SiGoogledrive, SiNotion } from "react-icons/si";
import { toast } from "sonner";
import { cn } from "@largence/lib/utils";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (document: { id: string; title: string }) => void;
  mode?: "document" | "content"; // content mode returns just the content (for compliance)
  onContentImport?: (content: { title: string; content: string; provider: string }) => void;
}

interface FileEntry {
  type: "folder" | "file";
  id: string;
  name: string;
  path?: string;
  mimeType?: string;
  size?: number;
  modified?: string;
}

interface Integration {
  id: string;
  provider: string;
  status: string;
  name: string;
}

const PROVIDER_INFO: Record<string, { name: string; icon: any; color: string; bg: string }> = {
  DROPBOX: {
    name: "Dropbox",
    icon: SiDropbox,
    color: "text-[#0061FF]",
    bg: "bg-blue-600/10",
  },
  GOOGLE_DRIVE: {
    name: "Google Drive",
    icon: SiGoogledrive,
    color: "text-[#4285F4]",
    bg: "bg-blue-500/10",
  },
  NOTION: {
    name: "Notion",
    icon: SiNotion,
    color: "text-black dark:text-white",
    bg: "bg-black/5 dark:bg-white/10",
  },
};

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  mode = "document",
  onContentImport,
}: ImportDialogProps) {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);

  // Fetch connected integrations
  const { data: integrationsData, isLoading: loadingIntegrations } = useQuery<{
    integrations: Integration[];
  }>({
    queryKey: ["integrations"],
    queryFn: async () => {
      const response = await fetch("/api/integrations");
      if (!response.ok) throw new Error("Failed to fetch integrations");
      return response.json();
    },
    enabled: open,
  });

  // Filter to only show connected cloud storage integrations
  const connectedProviders = integrationsData?.integrations?.filter(
    (i) => ["DROPBOX", "GOOGLE_DRIVE", "NOTION"].includes(i.provider) && i.status === "CONNECTED"
  );

  // Fetch files from selected provider
  const {
    data: filesData,
    isLoading: loadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["import-files", selectedProvider, currentPath],
    queryFn: async () => {
      const params = new URLSearchParams({
        provider: selectedProvider!,
        path: currentPath,
      });
      const response = await fetch(`/api/integrations/import?${params}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
    enabled: !!selectedProvider && open,
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: FileEntry) => {
      const response = await fetch("/api/integrations/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          fileId: file.id,
          filePath: file.path,
          createDocument: mode === "document",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import file");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (mode === "document" && data.document) {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        toast.success("Document imported successfully");
        onImport?.(data.document);
      } else if (mode === "content") {
        onContentImport?.({
          title: data.title,
          content: data.content,
          provider: data.provider,
        });
        toast.success("Content imported successfully");
      }
      onOpenChange(false);
      resetState();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetState = () => {
    setSelectedProvider(null);
    setCurrentPath("");
    setPathHistory([]);
    setSelectedFile(null);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const navigateToFolder = (folder: FileEntry) => {
    setPathHistory((prev) => [...prev, currentPath]);
    setCurrentPath(folder.path || folder.id);
    setSelectedFile(null);
  };

  const navigateBack = () => {
    const previousPath = pathHistory[pathHistory.length - 1] || "";
    setPathHistory((prev) => prev.slice(0, -1));
    setCurrentPath(previousPath);
    setSelectedFile(null);
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  // Provider selection screen
  if (!selectedProvider) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Import from Cloud
            </DialogTitle>
            <DialogDescription>
              {mode === "document"
                ? "Import a document from your connected cloud storage."
                : "Import content from your connected cloud storage."}
            </DialogDescription>
          </DialogHeader>

          {loadingIntegrations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : connectedProviders && connectedProviders.length > 0 ? (
            <div className="grid gap-3 py-4">
              {connectedProviders.map((integration) => {
                const info = PROVIDER_INFO[integration.provider as keyof typeof PROVIDER_INFO];
                if (!info) return null;
                const Icon = info.icon;
                return (
                  <button
                    key={integration.id}
                    onClick={() => setSelectedProvider(integration.provider)}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div className={cn("p-2 rounded-lg", info.bg)}>
                      <Icon className={cn("h-5 w-5", info.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{info.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Browse and import files
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No integrations connected</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Dropbox or Google Drive in Settings → Integrations
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // File browser screen
  const providerInfo = PROVIDER_INFO[selectedProvider as keyof typeof PROVIDER_INFO];
  const ProviderIcon = providerInfo?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ProviderIcon && <ProviderIcon className={cn("h-5 w-5", providerInfo.color)} />}
            Import from {providerInfo?.name}
          </DialogTitle>
          <DialogDescription>
            {currentPath
              ? `/${currentPath.split("/").filter(Boolean).join("/")}`
              : "Select a file to import"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          {(pathHistory.length > 0 || currentPath) && (
            <Button variant="ghost" size="sm" onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentPath("");
              setPathHistory([]);
            }}
          >
            Root
          </Button>
        </div>

        <ScrollArea className="h-[300px] border rounded-lg">
          {loadingFiles ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filesData?.files?.length > 0 ? (
            <div className="p-2 space-y-1">
              {filesData.files.map((file: FileEntry) => (
                <button
                  key={file.id}
                  onClick={() => {
                    if (file.type === "folder") {
                      navigateToFolder(file);
                    } else {
                      setSelectedFile(file);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors text-left",
                    selectedFile?.id === file.id && "bg-accent ring-1 ring-primary"
                  )}
                >
                  {file.type === "folder" ? (
                    <FolderIcon className="h-5 w-5 text-blue-500 shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    {file.modified && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.modified).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {file.type === "folder" && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <FolderIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No files found</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProvider(null);
              setCurrentPath("");
              setPathHistory([]);
            }}
          >
            Back to providers
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
