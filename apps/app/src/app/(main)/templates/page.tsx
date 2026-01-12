"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Skeleton } from "@largence/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Eye,
  Sparkles,
  X,
  FileStack,
  Globe,
  Lock,
  MoreVertical,
  Trash2,
  Copy,
  Plus,
  FileText,
  Heart,
  Star,
  Users,
  Download,
} from "lucide-react";
import { templates as allTemplates, categories, Template } from "@/lib/templates-data";
import { TemplatePreviewModal } from "@largence/components/template-preview-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@largence/components/ui/tabs";

interface UserTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  documentType: string;
  jurisdiction: string | null;
  content: string;
  isPublished: boolean;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  reviewCount: number;
  likeCount: number;
  tags: string[];
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommunityTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  documentType: string;
  jurisdiction: string | null;
  content?: string;
  usageCount: number;
  rating: number;
  reviewCount: number;
  likeCount: number;
  tags: string[];
  authorName: string | null;
  publishedAt: string;
}

const ITEMS_PER_PAGE = 12;

async function fetchUserTemplates(): Promise<{ templates: UserTemplate[] }> {
  const response = await fetch("/api/templates?mine=true");
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

async function fetchCommunityTemplates(): Promise<{ templates: CommunityTemplate[] }> {
  const response = await fetch("/api/templates?community=true");
  if (!response.ok) throw new Error("Failed to fetch community templates");
  return response.json();
}

async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/templates/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete template");
}

async function togglePublishTemplate(id: string, publish: boolean): Promise<void> {
  const response = await fetch(`/api/templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publishToDirectory: publish, isPublic: publish }),
  });
  if (!response.ok) throw new Error("Failed to update template");
}

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [communityCategory, setCommunityCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [communityDisplayCount, setCommunityDisplayCount] = useState(ITEMS_PER_PAGE);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<UserTemplate | null>(null);
  const [previewUserTemplate, setPreviewUserTemplate] = useState<UserTemplate | null>(null);
  const [previewCommunityTemplate, setPreviewCommunityTemplate] = useState<CommunityTemplate | null>(null);
  
  // Loading states for template actions to prevent double-clicks
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);

  // Fetch user templates
  const { data: userTemplatesData, isLoading: loadingUserTemplates } = useQuery({
    queryKey: ["user-templates"],
    queryFn: fetchUserTemplates,
  });

  // Fetch community templates
  const { data: communityTemplatesData, isLoading: loadingCommunityTemplates } = useQuery({
    queryKey: ["community-templates"],
    queryFn: fetchCommunityTemplates,
  });

  const userTemplates = userTemplatesData?.templates || [];
  const communityTemplates = communityTemplatesData?.templates || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-templates"] });
      toast.success("Template deleted");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  // Publish/unpublish mutation
  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      togglePublishTemplate(id, publish),
    onSuccess: (_, { publish }) => {
      queryClient.invalidateQueries({ queryKey: ["user-templates"] });
      toast.success(publish ? "Template published to directory" : "Template unpublished");
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  // Mark onboarding item as complete when visiting templates
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding:explored_templates", "true");
      window.dispatchEvent(new CustomEvent("onboarding:progress"));
    }
  }, []);

  // Get unique jurisdictions from all templates
  const allJurisdictions = useMemo(() => {
    const jurisdictions = new Set<string>();
    allTemplates.forEach((template) => {
      template.jurisdictions.forEach((j) => jurisdictions.add(j));
    });
    return Array.from(jurisdictions).sort();
  }, []);

  // Filter and search library templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.jurisdictions.some((j) => j.toLowerCase().includes(query))
      );
    }

    if (jurisdictionFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.jurisdictions.some((j) => jurisdictionFilter.includes(j))
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory, jurisdictionFilter]);

  // Filter user templates
  const filteredUserTemplates = useMemo(() => {
    if (!searchQuery.trim()) return userTemplates;
    const query = searchQuery.toLowerCase();
    return userTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [userTemplates, searchQuery]);

  // Filter community templates
  const filteredCommunityTemplates = useMemo(() => {
    let filtered = communityTemplates;
    
    if (communityCategory !== "all") {
      filtered = filtered.filter(
        (t) => t.category.toLowerCase() === communityCategory.toLowerCase()
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [communityTemplates, communityCategory, searchQuery]);

  // Get community template categories
  const communityCategories = useMemo(() => {
    const cats = new Set<string>();
    communityTemplates.forEach((t) => cats.add(t.category));
    return ["all", ...Array.from(cats).sort()];
  }, [communityTemplates]);

  const displayedTemplates = filteredTemplates.slice(0, displayCount);
  const hasMore = displayCount < filteredTemplates.length;
  
  const displayedCommunityTemplates = filteredCommunityTemplates.slice(0, communityDisplayCount);
  const hasMoreCommunity = communityDisplayCount < filteredCommunityTemplates.length;

  const handleUseTemplate = (templateType: string) => {
    router.push(`/create?type=${templateType}`);
  };

  const handleUseCommunityTemplate = async (template: CommunityTemplate) => {
    if (usingTemplateId) return; // Prevent double-click
    setUsingTemplateId(template.id);
    // Redirect to create page with template ID
    router.push(`/create?template=${template.id}`);
  };

  const handleUseUserTemplate = async (template: UserTemplate) => {
    if (usingTemplateId) return; // Prevent double-click
    setUsingTemplateId(template.id);
    
    // Create a new document from this template
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${template.name} - Copy`,
          content: template.content,
          documentType: template.documentType,
          jurisdiction: template.jurisdiction || "General",
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Increment usage count
        fetch(`/api/templates/${template.id}?use=true`);
        router.push(`/documents/${data.document.id}`);
      } else {
        toast.error("Failed to create document from template");
        setUsingTemplateId(null);
      }
    } catch (error) {
      toast.error("Failed to create document from template");
      setUsingTemplateId(null);
    }
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const toggleJurisdiction = (jurisdiction: string) => {
    setJurisdictionFilter((prev) =>
      prev.includes(jurisdiction)
        ? prev.filter((j) => j !== jurisdiction)
        : [...prev, jurisdiction]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setJurisdictionFilter([]);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const handleDeleteClick = (template: UserTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) + jurisdictionFilter.length;

  return (
    <>
      <div className="p-3 pb-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold font-display">Templates</h1>
              <p className="text-sm text-muted-foreground">
                Browse the library or manage your saved templates
              </p>
            </div>
            <Button onClick={() => router.push("/create")} className="rounded-sm h-8 text-sm w-full sm:w-auto">
              <Sparkles className="h-3.5 w-3.5" />
              Create Custom
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 h-9 p-1 rounded-sm">
            <TabsTrigger value="library" className="text-sm rounded-sm h-7 px-3">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Library
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({filteredTemplates.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="community" className="text-sm rounded-sm h-7 px-3">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Community
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({communityTemplates.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="my-templates" className="text-sm rounded-sm h-7 px-3">
              <FileStack className="h-3.5 w-3.5 mr-1.5" />
              My Templates
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({userTemplates.length})
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Search - shared between tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  activeTab === "library"
                    ? "Search templates by name, category, or jurisdiction..."
                    : activeTab === "community"
                      ? "Search community templates..."
                      : "Search your templates..."
                }
                className="h-8 rounded-sm pl-9 pr-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {activeTab === "library" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 rounded-sm text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Filter by Jurisdiction</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-48">
                    {allJurisdictions.map((jurisdiction) => (
                      <DropdownMenuCheckboxItem
                        key={jurisdiction}
                        checked={jurisdictionFilter.includes(jurisdiction)}
                        onCheckedChange={() => toggleJurisdiction(jurisdiction)}
                      >
                        {jurisdiction}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </ScrollArea>
                  {activeFiltersCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8"
                          onClick={clearFilters}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Template Library Tab */}
          <TabsContent value="library" className="mt-0">
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {jurisdictionFilter.map((jurisdiction) => (
                  <span
                    key={jurisdiction}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-primary/10 text-primary text-xs border border-primary/20"
                  >
                    {jurisdiction}
                    <button
                      onClick={() => toggleJurisdiction(jurisdiction)}
                      className="hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                const categoryCount =
                  category.id === "all"
                    ? filteredTemplates.length
                    : filteredTemplates.filter(
                        (t) => t.category.toLowerCase() === category.id
                      ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="ml-2 text-xs opacity-70">({categoryCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Templates Grid */}
            {displayedTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  We couldn't find any templates matching your search criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayedTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="group relative flex flex-col rounded-sm border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="mb-2">
                        <div className="inline-flex p-2 rounded-sm bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold mb-1 font-heading line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.jurisdictions.slice(0, 2).map((jurisdiction, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-muted text-[10px]"
                          >
                            {jurisdiction}
                          </span>
                        ))}
                        {template.jurisdictions.length > 2 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-muted text-[10px]">
                            +{template.jurisdictions.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          className="flex-1 h-8 rounded-sm text-xs"
                          onClick={() => handleUseTemplate(template.type)}
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="h-8 rounded-sm text-sm"
                  onClick={handleLoadMore}
                >
                  Load More Templates ({filteredTemplates.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Community Templates Tab */}
          <TabsContent value="community" className="mt-0">
            {/* Category Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {communityCategories.map((cat) => {
                const isActive = communityCategory === cat;
                const categoryCount = cat === "all" 
                  ? communityTemplates.length
                  : communityTemplates.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setCommunityCategory(cat)}
                    className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{cat === "all" ? "All" : cat}</span>
                    <span className="ml-2 text-xs opacity-70">({categoryCount})</span>
                  </button>
                );
              })}
            </div>

            {loadingCommunityTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-sm border bg-card p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : displayedCommunityTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No templates found" : "No community templates yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Be the first to publish a template to the community! Save a document as a template and publish it to share with others."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayedCommunityTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group relative flex flex-col rounded-sm border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium line-clamp-1 flex-1">
                        {template.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 text-[10px] border border-violet-200 dark:border-violet-900 shrink-0">
                        <Globe className="h-3 w-3" />
                        Community
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description || "No description"}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                      <span>{template.category}</span>
                      {template.jurisdiction && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{template.jurisdiction}</span>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {template.usageCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        {template.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {template.likeCount}
                      </span>
                    </div>

                    {/* Author */}
                    {template.authorName && (
                      <p className="text-[10px] text-muted-foreground mb-2">
                        by {template.authorName}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                      <span className="text-[10px] text-muted-foreground">
                        {template.reviewCount} review{template.reviewCount !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-sm"
                          onClick={() => setPreviewCommunityTemplate(template)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 rounded-sm text-xs"
                          onClick={() => handleUseCommunityTemplate(template)}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Community */}
            {hasMoreCommunity && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="h-8 rounded-sm text-sm"
                  onClick={() => setCommunityDisplayCount((prev) => prev + ITEMS_PER_PAGE)}
                >
                  Load More ({filteredCommunityTemplates.length - communityDisplayCount} remaining)
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Templates Tab */}
          <TabsContent value="my-templates" className="mt-0">
            {loadingUserTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-sm border bg-card p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredUserTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <FileStack className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No templates found" : "No saved templates yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Save a document as a template from the editor to reuse it later or share it with others."}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={() => router.push("/documents")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Go to Documents
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredUserTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group relative flex flex-col rounded-sm border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium line-clamp-1 flex-1">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {template.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] border border-emerald-200 dark:border-emerald-900">
                            <Globe className="h-3 w-3" />
                            Published
                          </span>
                        ) : template.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[10px] border border-blue-200 dark:border-blue-900">
                            <Globe className="h-3 w-3" />
                            Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-[10px] border border-slate-200 dark:border-slate-800">
                            <Lock className="h-3 w-3" />
                            Private
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleUseUserTemplate(template)}
                              className="text-xs"
                            >
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {template.isPublished ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  publishMutation.mutate({ id: template.id, publish: false })
                                }
                                className="text-xs"
                              >
                                <Lock className="h-3.5 w-3.5 mr-2" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  publishMutation.mutate({ id: template.id, publish: true })
                                }
                                className="text-xs"
                              >
                                <Globe className="h-3.5 w-3.5 mr-2" />
                                Publish to Directory
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(template)}
                              className="text-destructive text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description || "No description"}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
                      <span>{template.category}</span>
                      {template.jurisdiction && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{template.jurisdiction}</span>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                      <span className="text-[10px] text-muted-foreground">
                        Used {template.usageCount} time{template.usageCount !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-sm"
                          onClick={() => setPreviewUserTemplate(template)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 rounded-sm text-xs"
                          onClick={() => handleUseUserTemplate(template)}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* User Template Preview Dialog */}
      <Dialog open={!!previewUserTemplate} onOpenChange={(open) => !open && setPreviewUserTemplate(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] rounded-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileStack className="h-4 w-4 text-primary" />
              <DialogTitle className="text-base flex-1">{previewUserTemplate?.name}</DialogTitle>
              {previewUserTemplate && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] border mr-6 ${
                  previewUserTemplate.isPublished
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                    : previewUserTemplate.isPublic
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                    : "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}>
                  {previewUserTemplate.isPublished ? <><Globe className="h-3 w-3" /> Published</> : previewUserTemplate.isPublic ? <><Globe className="h-3 w-3" /> Public</> : <><Lock className="h-3 w-3" /> Private</>}
                </span>
              )}
            </div>
            <DialogDescription className="text-xs">
              {previewUserTemplate?.category} • {previewUserTemplate?.documentType}{previewUserTemplate?.jurisdiction && ` • ${previewUserTemplate.jurisdiction}`}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-3">
            {previewUserTemplate?.description || "No description"}
          </div>
          <div className="overflow-y-auto max-h-[50vh] pr-2 border rounded-sm p-3 bg-muted/30">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewUserTemplate?.content || "<p>No content</p>" }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewUserTemplate(null)}
              className="h-8 rounded-sm text-sm"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewUserTemplate) {
                  handleUseUserTemplate(previewUserTemplate);
                  setPreviewUserTemplate(null);
                }
              }}
              className="h-8 rounded-sm text-sm"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Community Template Preview Dialog */}
      <Dialog open={!!previewCommunityTemplate} onOpenChange={(open) => !open && setPreviewCommunityTemplate(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] rounded-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <DialogTitle className="text-base flex-1">{previewCommunityTemplate?.name}</DialogTitle>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 text-[10px] border border-violet-200 dark:border-violet-900 mr-6">
                <Users className="h-3 w-3" />
                Community
              </span>
            </div>
            <DialogDescription className="text-xs">
              {previewCommunityTemplate?.category} • {previewCommunityTemplate?.documentType}{previewCommunityTemplate?.jurisdiction && ` • ${previewCommunityTemplate.jurisdiction}`}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-3">
            {previewCommunityTemplate?.description || "No description"}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground py-3 border-y">
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {previewCommunityTemplate?.usageCount} uses
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {previewCommunityTemplate?.rating.toFixed(1)} ({previewCommunityTemplate?.reviewCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              {previewCommunityTemplate?.likeCount} likes
            </span>
            {previewCommunityTemplate?.authorName && (
              <span>by {previewCommunityTemplate.authorName}</span>
            )}
          </div>
          {previewCommunityTemplate?.content ? (
            <div className="overflow-y-auto max-h-[45vh] pr-2 border rounded-sm p-3 bg-muted/30">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewCommunityTemplate.content }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 border rounded-sm bg-muted/30">
              <p className="text-sm text-muted-foreground">Content preview available after using this template</p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewCommunityTemplate(null)}
              className="h-8 rounded-sm text-sm"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewCommunityTemplate) {
                  handleUseCommunityTemplate(previewCommunityTemplate);
                  setPreviewCommunityTemplate(null);
                }
              }}
              className="h-8 rounded-sm text-sm"
            >
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedTemplate(null);
        }}
        onUseTemplate={handleUseTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Template</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {templateToDelete?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
              className="h-8 rounded-sm text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => templateToDelete && deleteMutation.mutate(templateToDelete.id)}
              disabled={deleteMutation.isPending}
              className="h-8 rounded-sm text-sm"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
