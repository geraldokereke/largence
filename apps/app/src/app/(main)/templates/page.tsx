"use client";

import { useState, useMemo } from "react";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import { templates as allTemplates, categories, Template } from "@/lib/templates-data";
import { TemplatePreviewModal } from "@largence/components/template-preview-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 12;

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string[]>([]);

  // Get unique jurisdictions from all templates
  const allJurisdictions = useMemo(() => {
    const jurisdictions = new Set<string>();
    allTemplates.forEach((template) => {
      template.jurisdictions.forEach((j) => jurisdictions.add(j));
    });
    return Array.from(jurisdictions).sort();
  }, []);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
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

    // Jurisdiction filter
    if (jurisdictionFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.jurisdictions.some((j) => jurisdictionFilter.includes(j))
      );
    }

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory, jurisdictionFilter]);

  const displayedTemplates = filteredTemplates.slice(0, displayCount);
  const hasMore = displayCount < filteredTemplates.length;

  const handleUseTemplate = (templateType: string) => {
    router.push(`/create?type=${templateType}`);
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

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    jurisdictionFilter.length;

  return (
    <>
      <div className="p-4 pb-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold mb-2 font-heading">
                  Template Library
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredTemplates.length} jurisdiction-specific legal template{filteredTemplates.length !== 1 ? 's' : ''} reviewed by experts
                </p>
              </div>
              <Button
                onClick={() => router.push("/create")}
                className="rounded-sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Custom
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, category, or jurisdiction..."
                className="h-10 rounded-sm pl-9 pr-9"
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-sm">
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
          </div>

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
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                  className={`px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="ml-2 text-xs opacity-70">
                    ({categoryCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Templates Grid */}
          {displayedTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                We couldn't find any templates matching your search criteria. Try
                adjusting your filters or search terms.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayedTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="group relative flex flex-col rounded-sm border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    {/* Icon */}
                    <div className="mb-2">
                      <div className="inline-flex p-2 rounded-sm bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-semibold mb-1 font-heading line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Jurisdictions */}
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

                    {/* Actions */}
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
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                className="h-10 rounded-sm"
                onClick={handleLoadMore}
              >
                Load More Templates ({filteredTemplates.length - displayCount}{" "}
                remaining)
              </Button>
            </div>
          )}

          {/* Results summary */}
          {displayedTemplates.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {displayedTemplates.length} of {filteredTemplates.length}{" "}
              template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

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
    </>
  );
}
