"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@largence/ui";
import { Footer } from "@/components/landing/Footer";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../app/src/components/ui/select";
import {
  Search,
  Filter,
  Heart,
  Star,
  Users,
  Download,
  Eye,
  Sparkles,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  ThumbsUp,
  FileText,
  Shield,
  Briefcase,
  Scale,
  Home,
  Building2,
  Globe,
  Loader2,
  ExternalLink,
} from "lucide-react";

// Import Navbar dynamically with no SSR since it uses useTheme
const Navbar = dynamic(
  () => import("@/components/Navbar").then((mod) => ({ default: mod.Navbar })),
  { ssr: false }
);

interface PublicTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  documentType: string;
  jurisdiction: string | null;
  tags: string[];
  usageCount: number;
  rating: number;
  reviewCount: number;
  likeCount: number;
  authorName: string | null;
  authorAvatar: string | null;
  keyFeatures: string[];
  includedClauses: string[];
  suitableFor: string[];
  publishedAt: string;
  hasLiked: boolean;
}

interface Category {
  name: string;
  count: number;
}

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Employment: Users,
  Contracts: FileText,
  Corporate: Building2,
  "Real Estate": Home,
  "Intellectual Property": Shield,
  Compliance: Scale,
  Legal: Briefcase,
  International: Globe,
};

// Generate or retrieve session ID for anonymous users
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("largence_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("largence_session_id", sessionId);
  }
  return sessionId;
}

// Sort options
const sortOptions = [
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "likes", label: "Most Liked", icon: ThumbsUp },
  { value: "usage", label: "Most Used", icon: Download },
];

export default function TemplateMarketplacePage() {
  const [templates, setTemplates] = useState<PublicTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<PublicTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const { user, isSignedIn, isLoaded } = useUser();

  // Initialize session ID (use user ID if logged in, else anonymous session)
  useEffect(() => {
    if (isSignedIn && user?.id) {
      setSessionId(user.id);
    } else {
      setSessionId(getSessionId());
    }
  }, [isSignedIn, user?.id]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: sortBy,
        sessionId,
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, searchQuery, sessionId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handle like toggle - requires authentication and prevents double-liking
  const handleLike = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Require authentication to like
    if (!isSignedIn) {
      window.location.href = "https://app.largence.com/login";
      return;
    }

    // Find the template and check if already liked
    const template = templates.find(t => t.id === templateId);
    if (template?.hasLiked) {
      // Already liked - do nothing
      return;
    }
    
    try {
      const response = await fetch(`/api/templates/${templateId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId
              ? { ...t, hasLiked: data.liked, likeCount: data.likeCount }
              : t
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // Handle template preview
  const handlePreview = (template: PublicTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || FileText;
  };

  // All categories with "All" option
  const allCategories = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.count, 0);
    return [{ name: "all", count: total }, ...categories];
  }, [categories]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
              Template Marketplace
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Legal Templates{" "}<br className="hidden sm:block" />
              <span className="text-primary">Built for Africa</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse professionally crafted legal templates created by legal experts and the Largence community. 
              Ready to use, compliant, and customizable for your needs.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates by name, category, or jurisdiction..."
                className="w-full h-12 pl-12 pr-12 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{templates.length > 0 ? `${categories.reduce((sum, c) => sum + c.count, 0)}+ Templates` : "Loading..."}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Multi-Jurisdiction</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Compliance Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Categories */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {allCategories.map((category) => {
                  const isActive = selectedCategory === category.name;
                  return (
                    <button
                      key={category.name}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-md border whitespace-nowrap transition-all text-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent hover:border-accent"
                      }`}
                    >
                      {category.name === "all" ? "All Templates" : category.name}
                      <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <Select
                value={sortBy}
                onValueChange={(value: string) => {
                  setSortBy(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-35">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg border bg-card p-5 animate-pulse">
                  <div className="h-10 w-10 rounded-md bg-muted mb-4" />
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded mb-1" />
                  <div className="h-4 w-2/3 bg-muted rounded mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-5 w-16 bg-muted rounded" />
                    <div className="h-5 w-12 bg-muted rounded" />
                  </div>
                  <div className="h-9 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-5 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms or browse all categories."
                  : "No templates have been published yet. Check back soon!"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  return (
                    <div
                      key={template.id}
                      className="group relative flex flex-col rounded-lg border bg-card p-5 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handlePreview(template)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(template);
                            }}
                            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="Preview template"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleLike(template.id, e)}
                            disabled={template.hasLiked}
                            className={`p-2 rounded-md transition-all ${
                              template.hasLiked
                                ? "text-red-500 bg-red-50 dark:bg-red-950/30 cursor-default"
                                : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            }`}
                            title={!isSignedIn ? "Sign in to like" : template.hasLiked ? "You liked this" : "Like this template"}
                          >
                            <Heart
                              className={`h-4 w-4 ${template.hasLiked ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-heading font-semibold text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                          {template.category}
                        </span>
                        {template.jurisdiction && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                            {template.jurisdiction}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>{template.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground/60">({template.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className={`h-3.5 w-3.5 ${template.hasLiked ? "text-red-500 fill-red-500" : ""}`} />
                          <span>{formatNumber(template.likeCount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>{formatNumber(template.usageCount)}</span>
                        </div>
                      </div>

                      {/* Author */}
                      {template.authorName && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                            {template.authorAvatar || template.authorName.charAt(0)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            by {template.authorName}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-border/50 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Create & Share Your Templates
          </h2>
          <p className="text-muted-foreground mb-6">
            Join the Largence community and publish your legal templates to help
            businesses across Africa. Gain recognition and contribute to legal
            accessibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="px-6">
              <a href="https://app.largence.com/signup" className="inline-flex items-center gap-2">
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="px-6">
              <a href="https://app.largence.com/login" className="inline-flex items-center gap-2">
                Sign In to Publish
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Template Preview Modal */}
      {previewOpen && selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          sessionId={sessionId}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedTemplate(null);
          }}
          onLike={() => handleLike(selectedTemplate.id, { stopPropagation: () => {} } as React.MouseEvent)}
          isSignedIn={!!isSignedIn}
        />
      )}

      <Footer />
    </div>
  );
}

// Template Preview Modal Component
function TemplatePreviewModal({
  template,
  sessionId,
  onClose,
  onLike,
  isSignedIn,
}: {
  template: PublicTemplate;
  sessionId: string;
  onClose: () => void;
  onLike: () => void;
  isSignedIn: boolean;
}) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [localTemplate, setLocalTemplate] = useState(template);

  const handleSubmitRating = async () => {
    if (!userRating) return;
    
    setSubmittingRating(true);
    try {
      const response = await fetch(`/api/templates/${template.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          rating: userRating,
          review: review.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocalTemplate((prev) => ({
          ...prev,
          rating: data.rating,
          reviewCount: data.reviewCount,
        }));
        setReview("");
        setUserRating(0);
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setSubmittingRating(false);
    }
  };

  const CategoryIcon = categoryIcons[template.category] || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-lg border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b bg-background/95 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CategoryIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">
                {localTemplate.name}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                  {localTemplate.category}
                </span>
                {localTemplate.jurisdiction && (
                  <span>{localTemplate.jurisdiction}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localTemplate.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-y border-border/50">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{localTemplate.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({localTemplate.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart
                className={`h-5 w-5 ${
                  localTemplate.hasLiked ? "text-red-500 fill-red-500" : "text-muted-foreground"
                }`}
              />
              <span className="font-semibold">{localTemplate.likeCount}</span>
              <span className="text-sm text-muted-foreground">likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{localTemplate.usageCount}</span>
              <span className="text-sm text-muted-foreground">uses</span>
            </div>
          </div>

          {/* Key Features */}
          {localTemplate.keyFeatures && localTemplate.keyFeatures.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Key Features</h3>
              <ul className="space-y-2">
                {localTemplate.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Included Clauses */}
          {localTemplate.includedClauses && localTemplate.includedClauses.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Included Clauses</h3>
              <div className="flex flex-wrap gap-2">
                {localTemplate.includedClauses.map((clause, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs"
                  >
                    {clause}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suitable For */}
          {localTemplate.suitableFor && localTemplate.suitableFor.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Suitable For</h3>
              <div className="flex flex-wrap gap-2">
                {localTemplate.suitableFor.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          {localTemplate.authorName && (
            <div className="flex items-center gap-3 py-4 border-t border-border/50">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                {localTemplate.authorAvatar || localTemplate.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">Published by {localTemplate.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(localTemplate.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Rate This Template */}
          <div className="pt-4 border-t border-border/50">
            <h3 className="font-semibold text-sm mb-3">Rate This Template</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || userRating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {userRating} star{userRating !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <textarea
              placeholder="Leave a review (optional)..."
              className="w-full h-20 px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <Button
              onClick={handleSubmitRating}
              disabled={!userRating || submittingRating}
              className="mt-3"
              size="sm"
            >
              {submittingRating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 p-5 border-t bg-background/95 backdrop-blur">
          <button
            onClick={onLike}
            disabled={localTemplate.hasLiked}
            title={!isSignedIn ? "Sign in to like" : localTemplate.hasLiked ? "You liked this" : "Like this template"}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-all ${
              localTemplate.hasLiked
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 cursor-default"
                : "hover:bg-muted"
            }`}
          >
            <Heart className={`h-4 w-4 ${localTemplate.hasLiked ? "fill-current" : ""}`} />
            {localTemplate.hasLiked ? "Liked" : "Like"}
          </button>
          <Button asChild>
            <a href={`https://app.largence.com/create?template=${localTemplate.id}`}>
              Use This Template
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}