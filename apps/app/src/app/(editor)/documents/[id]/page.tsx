"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TipTapLink from "@tiptap/extension-link";
import TipTapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Spinner } from "@largence/components/ui/spinner";
import { UpgradeModal } from "@largence/components/upgrade-modal";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { SaveAsTemplateDialog } from "@largence/components/save-as-template-dialog";
import {
  AgenticComplianceModal,
  useAgenticComplianceModal,
} from "@largence/components/agentic-compliance-modal";
import { EditorSidebar } from "@/components/editor-sidebar";
import { RequestSignatureDialog } from "@/components/request-signature-dialog";
import { DocuSignSignatureDialog } from "@/components/docusign-signature-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Download,
  Save,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  FileDown,
  FileStack,
  PenTool,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Type,
  Sparkles,
  PanelRight,
  Share2,
  Cloud,
  Send,
} from "lucide-react";
import { ShareDocumentDialog } from "@/components/share-document-dialog";
import { ExportDocumentDialog } from "@/components/export-document-dialog";
import { Separator } from "@largence/components/ui/separator";

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [runningAgenticCompliance, setRunningAgenticCompliance] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [docuSignDialogOpen, setDocuSignDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "FINAL" | "ARCHIVED">("DRAFT");
  const [document, setDocument] = useState<any>(null);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const upgradeModal = useUpgradeModal();
  const agenticModal = useAgenticComplianceModal();
  const abortControllerRef = useRef<AbortController | null>(null);

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
      TipTapImage,
      Placeholder.configure({
        placeholder: "Start writing your document...",
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[600px] p-3 sm:p-8 md:p-10",
      },
    },
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const doc = data.document;
          setDocument(doc);
          setTitle(doc.title);
          let cleanContent = doc.content || "";
          cleanContent = cleanContent.replace(
            /```(?:html)?\n?([\s\S]*?)```/g,
            "$1"
          );
          cleanContent = cleanContent.replace(/`/g, "");
          cleanContent = cleanContent.trim();

          if (editor) {
            editor.commands.setContent(cleanContent);
          }
          setStatus(doc.status);
        } else {
          toast.error("Failed to load document", {
            description: "The document could not be loaded. Please try again.",
          });
          router.push("/documents");
        }
      } catch (error) {
        console.error("Error loading document:", error);
        toast.error("Error loading document", {
          description:
            "An unexpected error occurred while loading the document.",
        });
        router.push("/documents");
      } finally {
        setLoading(false);
      }
    };

    if (params.id && editor) {
      fetchDocument();
    }
  }, [params.id, router, editor]);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    setSaving(true);
    try {
      const content = editor.getHTML();
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
        toast.success("Document saved successfully", {
          description: "Your changes have been saved.",
        });
      } else {
        toast.error("Failed to save document", {
          description: "Please check your connection and try again.",
        });
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Error saving document", {
        description: "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  }, [editor, params.id, title, status]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleExportDOCX = useCallback(() => {
    if (!editor) return;
    setExporting(true);
    try {
      const editorContent = editor.getHTML();
      const blob = new Blob(
        [
          `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title></head>
        <body>${editorContent}</body>
        </html>
      `,
        ],
        { type: "application/msword" }
      );
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${title || "document"}.doc`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Exported as DOCX");
    } finally {
      setExporting(false);
    }
  }, [editor, title]);

  const handleExportPDF = useCallback(() => {
    if (!editor) return;
    setExporting(true);
    try {
      const editorContent = editor.getHTML();
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                h1 { font-size: 24px; margin-bottom: 20px; }
                h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
                p { margin-bottom: 15px; }
              </style>
            </head>
            <body>
              ${editorContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        toast.success("PDF export ready");
      }
    } finally {
      setExporting(false);
    }
  }, [editor, title]);

  const handleSendToDocuSign = useCallback(() => {
    setDocuSignDialogOpen(true);
  }, []);

  const handleRunComplianceCheck = useCallback(async () => {
    if (!editor || !params.id) return;

    setCheckingCompliance(true);
    try {
      const content = editor.getHTML();
      const response = await fetch(`/api/documents/${params.id}/compliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          documentType: document?.type || "Contract",
          jurisdiction: document?.jurisdiction || "Nigeria",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Compliance check completed", {
          description: `Score: ${data.complianceCheck.overallScore}/100. Check your notifications for details.`,
        });
      } else if (response.status === 402) {
        // Payment required - show upgrade modal
        const data = await response.json();
        upgradeModal.openUpgradeModal({
          reason: data.error,
          feature: "compliance",
          currentPlan: data.currentPlan,
        });
      } else {
        toast.error("Compliance check failed", {
          description: "Failed to run compliance check. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error running compliance check:", error);
      toast.error("Compliance check error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setCheckingCompliance(false);
    }
  }, [editor, params.id, document, upgradeModal]);

  const runAgenticCompliance = useCallback(async () => {
    if (!editor || !params.id) return;

    setRunningAgenticCompliance(true);
    abortControllerRef.current = new AbortController();

    try {
      const content = editor.getHTML();
      const response = await fetch(
        `/api/documents/${params.id}/agentic-compliance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (response.status === 402) {
        const data = await response.json();
        upgradeModal.openUpgradeModal({
          reason: data.error,
          feature: "compliance",
          currentPlan: data.currentPlan,
        });
        return;
      }

      if (!response.ok) {
        toast.error("Agentic compliance failed", {
          description: "Failed to run agentic compliance. Please try again.",
        });
        return;
      }

      // Clear the editor and start streaming
      editor.commands.clearContent();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      toast.info("Agentic Compliance Running", {
        description: "AI is analyzing and fixing your document...",
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Clean the content (remove markdown code blocks if present)
        let cleanContent = accumulatedContent;
        cleanContent = cleanContent.replace(
          /```(?:html)?\n?([\s\S]*?)```/g,
          "$1"
        );
        cleanContent = cleanContent.replace(/^```html?\s*/i, "");
        cleanContent = cleanContent.trim();

        // Update editor with accumulated content
        editor.commands.setContent(cleanContent);

        // Scroll to bottom of editor
        const editorElement = window.document.querySelector(".ProseMirror");
        if (editorElement) {
          editorElement.scrollTop = editorElement.scrollHeight;
        }
      }

      toast.success("Agentic Compliance Complete", {
        description:
          "Your document has been updated with compliance fixes. Review the changes.",
      });
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.info("Agentic compliance cancelled");
      } else {
        console.error("Error running agentic compliance:", error);
        toast.error("Agentic compliance error", {
          description: "An unexpected error occurred.",
        });
      }
    } finally {
      setRunningAgenticCompliance(false);
      abortControllerRef.current = null;
    }
  }, [editor, params.id, upgradeModal]);

  const handleAgenticComplianceClick = useCallback(() => {
    agenticModal.openModal(runAgenticCompliance);
  }, [agenticModal, runAgenticCompliance]);

  const cancelAgenticCompliance = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header - Absolutely fixed height to prevent layout shifts */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        {/* Title Bar - Fixed 52px height */}
        <div
          className="grid items-center px-3 gap-3 h-[52px]"
          style={{ gridTemplateColumns: "auto 1fr auto" }}
        >
          {/* Left: Back button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
              className="h-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Center: Title input */}
          <div className="flex items-center justify-center gap-2 min-w-0">
            <Separator orientation="vertical" className="h-5" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-base border-0 focus-visible:ring-0 px-2 h-8 max-w-[180px] sm:max-w-[300px] text-center truncate"
              placeholder="Untitled Document"
            />
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-1.5 justify-end">
            <Select
              value={status}
              onValueChange={async (val: "DRAFT" | "FINAL" | "ARCHIVED") => {
                const previousStatus = status;
                setStatus(val);

                // Save status change immediately
                try {
                  const response = await fetch(`/api/documents/${params.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: val }),
                  });

                  if (response.ok) {
                    const data = await response.json();
                    setDocument(data.document);
                    const statusLabels = {
                      DRAFT: "Draft",
                      FINAL: "Final",
                      ARCHIVED: "Archived",
                    };
                    toast.success(`Status changed to ${statusLabels[val]}`, {
                      description:
                        val === "FINAL"
                          ? "Document has been finalized and is ready for use."
                          : val === "ARCHIVED"
                            ? "Document has been archived."
                            : "Document is now in draft mode.",
                    });
                  } else {
                    setStatus(previousStatus);
                    toast.error("Failed to update status");
                  }
                } catch (error) {
                  setStatus(previousStatus);
                  toast.error("Failed to update status");
                }
              }}
            >
              <SelectTrigger className="h-8 w-[90px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="DRAFT">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="FINAL">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Final
                  </div>
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    Archived
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Combined Save & Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={saving || exporting}
                  size="sm"
                  className="h-8"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" />
                      <span className="hidden sm:inline sm:ml-1.5">Saving</span>
                    </>
                  ) : exporting ? (
                    <>
                      <Spinner size="sm" />
                      <span className="hidden sm:inline sm:ml-1.5">Exporting</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline sm:ml-1.5">Save</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSaveTemplateOpen(true)}>
                  <FileStack className="h-4 w-4 mr-2" />
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportDOCX}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                  <Cloud className="h-4 w-4 mr-2" />
                  Export to Cloud
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSignatureDialogOpen(true)}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Request Signature
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendToDocuSign}>
                  <Send className="h-4 w-4 mr-2" />
                  Send via DocuSign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-1.5">Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelRight className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-1.5">Tools</span>
            </Button>
          </div>
        </div>

        {/* Formatting Toolbar - Fixed 48px height */}
        <div className="flex items-center gap-1 px-3 border-t bg-muted/30 overflow-x-auto overflow-y-hidden scrollbar-thin h-12">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              className="h-8 w-8 p-0 shrink-0"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              className="h-8 w-8 p-0 shrink-0"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Font Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <Select
              value={editor.getAttributes("textStyle").fontFamily || "Arial"}
              onValueChange={(value) =>
                editor.chain().focus().setFontFamily(value).run()
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("bold") ? "bg-muted" : ""}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("italic") ? "bg-muted" : ""}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("underline") ? "bg-muted" : ""}`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("strike") ? "bg-muted" : ""}`}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Color Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  title="Text Color"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 z-50">
                <div className="grid grid-cols-6 gap-1 p-2">
                  {[
                    "#000000",
                    "#434343",
                    "#666666",
                    "#999999",
                    "#b7b7b7",
                    "#cccccc",
                    "#ff0000",
                    "#ff9900",
                    "#ffff00",
                    "#00ff00",
                    "#00ffff",
                    "#0000ff",
                    "#9900ff",
                    "#ff00ff",
                    "#990000",
                    "#cc6600",
                    "#cccc00",
                    "#009900",
                    "#009999",
                    "#000099",
                    "#660099",
                    "#990099",
                  ].map((color) => (
                    <button
                      key={color}
                      className="h-6 w-6 rounded-sm border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        editor.chain().focus().setColor(color).run()
                      }
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  title="Highlight Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 z-50">
                <div className="grid grid-cols-6 gap-1 p-2">
                  {[
                    "transparent",
                    "#ffff00",
                    "#00ff00",
                    "#00ffff",
                    "#ff00ff",
                    "#ff0000",
                    "#0000ff",
                    "#ffcc99",
                    "#ffff99",
                    "#ccffcc",
                    "#ccffff",
                    "#ffccff",
                  ].map((color) => (
                    <button
                      key={color}
                      className="h-6 w-6 rounded-sm border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        color === "transparent"
                          ? editor.chain().focus().unsetHighlight().run()
                          : editor
                              .chain()
                              .focus()
                              .toggleHighlight({ color })
                              .run()
                      }
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}`}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""}`}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Lists */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("bulletList") ? "bg-muted" : ""}`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`h-8 w-8 p-0 shrink-0 ${editor.isActive("orderedList") ? "bg-muted" : ""}`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Insert Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={addLink}
              className="h-8 w-8 p-0 shrink-0"
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addImage}
              className="h-8 w-8 p-0 shrink-0"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 shrink-0" />

          {/* Heading Styles */}
          <Select
            value={
              editor.isActive("heading", { level: 1 })
                ? "h1"
                : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                    ? "h3"
                    : editor.isActive("heading", { level: 4 })
                      ? "h4"
                      : editor.isActive("heading", { level: 5 })
                        ? "h5"
                        : editor.isActive("heading", { level: 6 })
                          ? "h6"
                          : "p"
            }
            onValueChange={(value) => {
              if (value === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(value.replace("h", "")) as
                  | 1
                  | 2
                  | 3
                  | 4
                  | 5
                  | 6;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
          >
            <SelectTrigger className="w-28 h-8 text-xs shrink-0">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="p">Normal</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="h5">Heading 5</SelectItem>
              <SelectItem value="h6">Heading 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor Area - Calculated height based on fixed header (52px + 48px = 100px) */}
      <div
        className="flex overflow-hidden"
        style={{ height: "calc(100vh - 100px)" }}
      >
        {/* Main Editor Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/50">
          <div className="flex justify-center py-4 px-2">
            {/* A4 Document Container */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-background border shadow-sm">
              {/* Document Metadata - Compact header */}
              <div className="px-6 py-2 border-b bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-mono">ID: {params.id ? String(params.id).slice(0, 8) : "N/A"}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span>
                    {document?.createdAt
                      ? new Date(document.createdAt).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === "DRAFT"
                        ? "bg-yellow-500"
                        : status === "FINAL"
                          ? "bg-green-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="font-medium">{status}</span>
                </div>
              </div>

              {/* Document Editor - A4 content area */}
              <div className="min-h-[280mm]">
                <EditorContent editor={editor} className="prose prose-sm max-w-none px-12 py-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Editor Sidebar */}
        <EditorSidebar
          documentId={params.id as string}
          getContent={() => editor?.getHTML() || ""}
          setContent={(content) => {
            if (editor) {
              editor.commands.setContent(content);
              toast.success("Document updated by AI");
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSignatureDialog={() => setSignatureDialogOpen(true)}
          onRunAgenticCompliance={handleAgenticComplianceClick}
          runningAgenticCompliance={runningAgenticCompliance}
          onCancelAgenticCompliance={cancelAgenticCompliance}
          onRequireUpgrade={(options) => upgradeModal.openUpgradeModal({
            reason: options.reason,
            feature: options.feature as "document" | "compliance" | "general",
            currentPlan: options.currentPlan,
          })}
        />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.closeUpgradeModal}
        reason={upgradeModal.reason}
        feature={upgradeModal.feature}
        currentPlan={upgradeModal.currentPlan}
      />

      {/* Agentic Compliance Modal */}
      <AgenticComplianceModal
        isOpen={agenticModal.isOpen}
        onClose={agenticModal.closeModal}
        onProceed={agenticModal.handleProceed}
      />

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        documentTitle={title}
        documentContent={editor?.getHTML() || ""}
        documentType={document?.documentType}
        jurisdiction={document?.jurisdiction}
      />

      {/* Request Signature Dialog */}
      <RequestSignatureDialog
        documentId={params.id as string}
        documentTitle={title}
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
      />

      {/* DocuSign Signature Dialog */}
      <DocuSignSignatureDialog
        documentId={params.id as string}
        documentTitle={title}
        open={docuSignDialogOpen}
        onOpenChange={setDocuSignDialogOpen}
      />

      {/* Share Document Dialog */}
      <ShareDocumentDialog
        documentId={params.id as string}
        documentTitle={title}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        isOwner={true}
        currentVisibility={document?.visibility || "PRIVATE"}
        onVisibilityChange={(visibility) => {
          setDocument((prev: any) => ({ ...prev, visibility }));
        }}
      />

      {/* Export Document Dialog */}
      <ExportDocumentDialog
        documentId={params.id as string}
        documentTitle={title}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </div>
  );
}
