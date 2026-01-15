"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@largence/components/empty-state";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Skeleton } from "@largence/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@largence/components/ui/tabs";
import { Badge } from "@largence/components/ui/badge";
import { NewDocumentDialog } from "@largence/components/new-document-dialog";
import {
  FileText,
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  GripVertical,
  Users,
  Share2,
  Cloud,
  PenTool,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@largence/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ShareDocumentDialog } from "@/components/share-document-dialog";
import { ExportDocumentDialog } from "@/components/export-document-dialog";
import { ImportDialog } from "@/components/import-dialog";
import { DocuSignSignatureDialog } from "@/components/docusign-signature-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Document {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "FINAL" | "ARCHIVED";
  documentType: string;
  jurisdiction: string;
  visibility?: string;
  userId?: string;
  collaboratorPermission?: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
}

interface DocumentsResponse {
  documents: Document[];
  filter?: string;
}

type ViewMode = "grid" | "list" | "compact";
type DocumentFilter = "my" | "team" | "shared";

const ITEMS_PER_PAGE = 12;
const VIEW_MODE_KEY = "largence_documents_view_mode";
const DOCUMENT_ORDER_KEY = "largence_documents_order";
const DOCUMENT_FILTER_KEY = "largence_documents_filter";

async function fetchDocuments(filter: DocumentFilter = "my"): Promise<DocumentsResponse> {
  const response = await fetch(`/api/documents?filter=${filter}`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

// Sortable document card component
function SortableDocumentCard({
  doc,
  viewMode,
  getStatusColor,
  onEdit,
  onExport,
  onExportCloud,
  onDelete,
  onPreview,
  onShare,
  onDocuSign,
}: {
  doc: Document;
  viewMode: ViewMode;
  getStatusColor: (status: string) => string;
  onEdit: (id: string) => void;
  onExport: (doc: Document, e: React.MouseEvent) => void;
  onExportCloud: (doc: Document, e: React.MouseEvent) => void;
  onDelete: (doc: Document, e: React.MouseEvent) => void;
  onPreview: (doc: Document) => void;
  onShare: (doc: Document, e: React.MouseEvent) => void;
  onDocuSign: (doc: Document, e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getContentPreview = (content: string, title: string) => {
    let cleanText = content || "";
    cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    cleanText = cleanText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
    cleanText = cleanText.replace(/`[^`]*`/g, "");
    cleanText = cleanText.replace(/\b(?:body|html|h[1-6]|p|div|span|\.[\w-]+|#[\w-]+)\s*\{[^}]*\}/g, "");
    cleanText = cleanText.replace(/\{[^}]*\}/g, "");
    cleanText = cleanText.replace(/<[^>]*>/g, " ");
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    const titleLower = title.toLowerCase();
    const cleanLower = cleanText.toLowerCase();
    if (cleanLower.startsWith(titleLower)) {
      cleanText = cleanText.substring(title.length).trim();
    }
    if (!cleanText || cleanText.length === 0) {
      return "No preview available";
    }
    return cleanText.length > 100 ? cleanText.substring(0, 100) + "..." : cleanText;
  };

  if (viewMode === "list") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group flex items-center gap-3 rounded-sm border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all"
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-shrink-0 p-2 rounded-sm bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(doc.id)}>
          <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {doc.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{doc.documentType}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{doc.jurisdiction}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getStatusColor(doc.status)}`}>
          {doc.status}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm opacity-0 group-hover:opacity-100" onClick={() => onPreview(doc)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(doc.id)} className="text-xs">
                <Edit className="h-3.5 w-3.5 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onShare(doc, e)} className="text-xs">
                <Share2 className="h-3.5 w-3.5 mr-2" />Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDocuSign(doc, e)} className="text-xs">
                <PenTool className="h-3.5 w-3.5 mr-2" />Request Signature
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onExport(doc, e)} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-2" />Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onExportCloud(doc, e)} className="text-xs">
                <Cloud className="h-3.5 w-3.5 mr-2" />Export to Cloud
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDelete(doc, e)} className="text-destructive text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group flex items-center gap-2 rounded-sm border bg-card px-3 py-2 hover:border-primary/30 transition-all cursor-pointer"
        onClick={() => onEdit(doc.id)}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
          {doc.title}
        </span>
        <span className="text-[10px] text-muted-foreground">{doc.documentType}</span>
        <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[9px] font-medium uppercase ${getStatusColor(doc.status)}`}>
          {doc.status}
        </span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onPreview(doc); }}>
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Default grid view
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-sm border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col h-full"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <h3
            className="text-sm font-medium line-clamp-1 flex-1 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onEdit(doc.id)}
          >
            {doc.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getStatusColor(doc.status)}`}>
            {doc.status}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(doc.id)} className="text-xs">
                <Edit className="h-3.5 w-3.5 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onShare(doc, e)} className="text-xs">
                <Share2 className="h-3.5 w-3.5 mr-2" />Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDocuSign(doc, e)} className="text-xs">
                <PenTool className="h-3.5 w-3.5 mr-2" />Request Signature
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onExport(doc, e)} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-2" />Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onExportCloud(doc, e)} className="text-xs">
                <Cloud className="h-3.5 w-3.5 mr-2" />Export to Cloud
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onDelete(doc, e)} className="text-destructive text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
        <span className="truncate">{doc.documentType}</span>
        <span className="text-muted-foreground/50">•</span>
        <span className="truncate">{doc.jurisdiction}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed cursor-pointer flex-1\" onClick={() => onEdit(doc.id)}>
        {getContentPreview(doc.content, doc.title)}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-muted-foreground/70" />
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 rounded-sm opacity-0 group-hover:opacity-100 text-[10px]" onClick={() => onPreview(doc)}>
          <Eye className="h-3 w-3 mr-1" />Preview
        </Button>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [newDocDialogOpen, setNewDocDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [shareDocument, setShareDocument] = useState<Document | null>(null);
  const [exportCloudDocument, setExportCloudDocument] = useState<Document | null>(null);
  const [docuSignDocument, setDocuSignDocument] = useState<Document | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // New state for enhanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");
  const [documentOrder, setDocumentOrder] = useState<string[]>([]);
  
  // Get filter from URL or localStorage
  const urlFilter = searchParams.get("filter") as DocumentFilter | null;
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>(urlFilter || "my");

  // Sync filter with URL params
  useEffect(() => {
    if (urlFilter && ["my", "team", "shared"].includes(urlFilter)) {
      setDocumentFilter(urlFilter);
    }
  }, [urlFilter]);

  // Load persisted view mode and document order
  useEffect(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (savedViewMode && ["grid", "list", "compact"].includes(savedViewMode)) {
      setViewMode(savedViewMode as ViewMode);
    }
    const savedOrder = localStorage.getItem(DOCUMENT_ORDER_KEY);
    if (savedOrder) {
      try {
        setDocumentOrder(JSON.parse(savedOrder));
      } catch {}
    }
    // Only use saved filter if no URL filter
    if (!urlFilter) {
      const savedFilter = localStorage.getItem(DOCUMENT_FILTER_KEY);
      if (savedFilter && ["my", "team", "shared"].includes(savedFilter)) {
        setDocumentFilter(savedFilter as DocumentFilter);
      }
    }
  }, [urlFilter]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Persist document filter and update URL
  const handleFilterChange = (filter: DocumentFilter) => {
    setDocumentFilter(filter);
    localStorage.setItem(DOCUMENT_FILTER_KEY, filter);
    // Update URL without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("filter", filter);
    window.history.pushState({}, "", url.toString());
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", documentFilter],
    queryFn: () => fetchDocuments(documentFilter),
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted", {
        description: "The document has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete document", {
        description: "Please try again.",
      });
    },
  });

  const documents = data?.documents || [];

  // Filter and sort documents
  const processedDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.documentType.toLowerCase().includes(query) ||
          doc.jurisdiction.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query)
      );
    }

    // Sort
    let sorted = [...filtered];
    if (documentOrder.length > 0 && !searchQuery) {
      // Use custom order if available and not searching
      sorted.sort((a, b) => {
        const aIndex = documentOrder.indexOf(a.id);
        const bIndex = documentOrder.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    } else {
      switch (sortBy) {
        case "title":
          sorted.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "created":
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "updated":
        default:
          sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    }

    return sorted;
  }, [documents, searchQuery, sortBy, documentOrder]);

  // Pagination
  const totalPages = Math.ceil(processedDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedDocuments.slice(start, start + ITEMS_PER_PAGE);
  }, [processedDocuments, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = processedDocuments.findIndex((d) => d.id === active.id);
      const newIndex = processedDocuments.findIndex((d) => d.id === over.id);
      const newOrder = arrayMove(processedDocuments.map((d) => d.id), oldIndex, newIndex);
      setDocumentOrder(newOrder);
      localStorage.setItem(DOCUMENT_ORDER_KEY, JSON.stringify(newOrder));
      toast.success("Document order updated");
    }
  }, [processedDocuments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900";
      case "FINAL":
        return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900";
      case "ARCHIVED":
        return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900/50 dark:border-slate-800";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900/50 dark:border-slate-800";
    }
  };

  const handleDeleteClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleShareClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDocument(doc);
  };

  const handleExportCloudClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setExportCloudDocument(doc);
  };

  const handleDocuSignClick = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuSignDocument(doc);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  const handleExport = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob(
      [
        `<html>
        <head><meta charset='utf-8'><title>${doc.title}</title></head>
        <body>${doc.content}</body>
        </html>`,
      ],
      { type: "application/msword" }
    );
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${doc.title || "document"}.doc`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Document exported", {
      description: "Your document has been downloaded.",
    });
  };

  const getGridClass = () => {
    switch (viewMode) {
      case "list":
      case "compact":
        return "flex flex-col gap-2";
      default:
        return "grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mb-1">
          <Skeleton className="h-6 w-36 mb-1" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-sm border bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-5 w-14 rounded-sm" />
              </div>
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-3">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-base font-semibold mb-1.5">Failed to load documents</h2>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your documents.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    const emptyStateConfig = {
      my: {
        title: "No documents yet",
        description: "Get started by generating your first AI-powered legal document",
        showCreate: true,
      },
      team: {
        title: "No team documents",
        description: "Documents shared with the entire team will appear here. Share your documents with your team to collaborate.",
        showCreate: false,
      },
      shared: {
        title: "Nothing shared with you",
        description: "When team members share documents with you specifically, they'll appear here.",
        showCreate: false,
      },
    };
    const config = emptyStateConfig[documentFilter];

    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mb-1">
          <h1 className="text-xl font-semibold font-display">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>

        {/* Document Filter Tabs */}
        {organization && (
          <Tabs value={documentFilter} onValueChange={(v) => handleFilterChange(v as DocumentFilter)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-9">
              <TabsTrigger value="my" className="text-xs gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                My Documents
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Team
              </TabsTrigger>
              <TabsTrigger value="shared" className="text-xs gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                Shared with Me
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <EmptyState
          icon={documentFilter === "team" ? Users : documentFilter === "shared" ? Share2 : FileText}
          title={config.title}
          description={config.description}
          primaryAction={config.showCreate ? {
            label: "Generate Document",
            onClick: () => router.push("/create"),
          } : undefined}
          secondaryAction={null}
          showTemplates={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      {/* Header */}
      <div className="mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold font-display">Documents</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {processedDocuments.length} document{processedDocuments.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="h-8 w-8 rounded-sm">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="h-8 rounded-sm text-sm">
            <Cloud className="h-3.5 w-3.5 mr-1" />
            Import
          </Button>
          <Button onClick={() => setNewDocDialogOpen(true)} className="h-8 rounded-sm text-sm flex-1 sm:flex-none">
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Document
          </Button>
        </div>
      </div>

      {/* Document Filter Tabs */}
      {organization && (
        <Tabs value={documentFilter} onValueChange={(v) => handleFilterChange(v as DocumentFilter)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-9">
            <TabsTrigger value="my" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              My Documents
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="shared" className="text-xs gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Shared with Me
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-sm border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border rounded-sm p-0.5 bg-muted/30">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-sm transition-colors ${
              viewMode === "grid" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid view"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-sm transition-colors ${
              viewMode === "list" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("compact")}
            className={`p-1.5 rounded-sm transition-colors ${
              viewMode === "compact" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Compact view"
          >
            <LayoutList className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Documents Grid/List with DnD */}
      {processedDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No documents match your search</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-primary hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={paginatedDocuments.map((d) => d.id)}
            strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={getGridClass()}>
              {paginatedDocuments.map((doc) => (
                <SortableDocumentCard
                  key={doc.id}
                  doc={doc}
                  viewMode={viewMode}
                  getStatusColor={getStatusColor}
                  onEdit={(id) => router.push(`/documents/${id}`)}
                  onDelete={handleDeleteClick}
                  onExport={handleExport}
                  onExportCloud={handleExportCloudClick}
                  onPreview={setPreviewDocument}
                  onShare={handleShareClick}
                  onDocuSign={handleDocuSignClick}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 rounded-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                // Add ellipsis if there's a gap
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;
                return (
                  <span key={page} className="contents">
                    {showEllipsis && (
                      <span className="px-1 text-muted-foreground">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-sm text-sm transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 rounded-sm"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-sm bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <DialogTitle className="text-base">Delete Document</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {documentToDelete?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDocumentToDelete(null);
              }}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] rounded-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <DialogTitle className="text-base flex-1">{previewDocument?.title}</DialogTitle>
              {previewDocument && (
                <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase mr-6 ${getStatusColor(previewDocument.status)}`}>
                  {previewDocument.status}
                </span>
              )}
            </div>
            <DialogDescription className="text-xs">
              {previewDocument?.documentType} • {previewDocument?.jurisdiction}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewDocument?.content || "" }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => previewDocument && handleExport(previewDocument, { stopPropagation: () => {} } as React.MouseEvent)}
              className="h-8 rounded-sm text-sm"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
            <Button
              onClick={() => {
                if (previewDocument) {
                  router.push(`/documents/${previewDocument.id}`);
                  setPreviewDocument(null);
                }
              }}
              className="h-8 rounded-sm text-sm"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Document Dialog */}
      <NewDocumentDialog open={newDocDialogOpen} onOpenChange={setNewDocDialogOpen} />

      {/* Share Document Dialog */}
      {shareDocument && (
        <ShareDocumentDialog
          documentId={shareDocument.id}
          documentTitle={shareDocument.title}
          open={!!shareDocument}
          onOpenChange={(open) => !open && setShareDocument(null)}
          isOwner={shareDocument.userId === userId}
          currentVisibility={shareDocument.visibility || "PRIVATE"}
          onVisibilityChange={(visibility) => {
            setShareDocument((prev) => prev ? { ...prev, visibility } : null);
          }}
        />
      )}

      {/* Export to Cloud Dialog */}
      {exportCloudDocument && (
        <ExportDocumentDialog
          documentId={exportCloudDocument.id}
          documentTitle={exportCloudDocument.title}
          open={!!exportCloudDocument}
          onOpenChange={(open) => !open && setExportCloudDocument(null)}
        />
      )}

      {/* DocuSign Signature Dialog */}
      {docuSignDocument && (
        <DocuSignSignatureDialog
          documentId={docuSignDocument.id}
          documentTitle={docuSignDocument.title}
          open={!!docuSignDocument}
          onOpenChange={(open) => !open && setDocuSignDocument(null)}
        />
      )}

      {/* Import from Cloud Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={(doc) => {
          router.push(`/documents/${doc.id}`);
        }}
      />
    </div>
  );
}
