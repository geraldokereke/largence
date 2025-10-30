import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { 
  Shield, 
  Users, 
  FileCheck, 
  Building2, 
  Briefcase, 
  Globe, 
  Search,
  Filter,
  Star,
  Clock,
  Download,
  Eye
} from "lucide-react"

const categories = [
  { id: "all", name: "All Templates", count: 48 },
  { id: "employment", name: "Employment", count: 12 },
  { id: "contracts", name: "Contracts", count: 15 },
  { id: "compliance", name: "Compliance", count: 8 },
  { id: "corporate", name: "Corporate", count: 9 },
  { id: "international", name: "International", count: 4 },
]

const templates = [
  {
    id: 1,
    name: "Employment Contract",
    category: "Employment",
    description: "Comprehensive employment agreement with terms, compensation, and benefits",
    icon: Users,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.8,
    usageCount: 1243,
    lastUpdated: "2 days ago",
    featured: true,
  },
  {
    id: 2,
    name: "Non-Disclosure Agreement (NDA)",
    category: "Contracts",
    description: "Protect confidential information with mutual or one-way NDA",
    icon: Shield,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.9,
    usageCount: 2156,
    lastUpdated: "1 week ago",
    featured: true,
  },
  {
    id: 3,
    name: "Service Agreement",
    category: "Contracts",
    description: "Professional services contract with scope, deliverables, and payment terms",
    icon: Briefcase,
    jurisdictions: ["Nigeria", "Ghana", "Kenya"],
    popularity: 4.7,
    usageCount: 987,
    lastUpdated: "3 days ago",
    featured: false,
  },
  {
    id: 4,
    name: "Privacy Policy",
    category: "Compliance",
    description: "GDPR and NDPR compliant privacy policy for data protection",
    icon: Shield,
    jurisdictions: ["EU", "Nigeria"],
    popularity: 4.6,
    usageCount: 756,
    lastUpdated: "1 week ago",
    featured: true,
  },
  {
    id: 5,
    name: "Board Resolution",
    category: "Corporate",
    description: "Document board decisions and corporate governance actions",
    icon: Building2,
    jurisdictions: ["Nigeria", "Ghana"],
    popularity: 4.5,
    usageCount: 543,
    lastUpdated: "2 weeks ago",
    featured: false,
  },
  {
    id: 6,
    name: "Consulting Agreement",
    category: "Contracts",
    description: "Independent contractor agreement with IP and confidentiality clauses",
    icon: Briefcase,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.7,
    usageCount: 892,
    lastUpdated: "4 days ago",
    featured: false,
  },
  {
    id: 7,
    name: "Terms of Service",
    category: "Compliance",
    description: "Website or app terms of service with user obligations and limitations",
    icon: FileCheck,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.4,
    usageCount: 654,
    lastUpdated: "1 week ago",
    featured: false,
  },
  {
    id: 8,
    name: "Cross-Border Agreement",
    category: "International",
    description: "International trade agreement with jurisdiction and dispute resolution",
    icon: Globe,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.6,
    usageCount: 432,
    lastUpdated: "5 days ago",
    featured: false,
  },
]

export default function TemplatesPage() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider defaultOpen={false} className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col p-4">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2 font-(family-name:--font-general-sans)">
                  Template Library
                </h1>
                <p className="text-sm text-muted-foreground">
                  Jurisdiction-specific legal templates reviewed by experts across 50+ countries
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    className="h-10 rounded-sm pl-9"
                  />
                </div>
                <Button variant="outline" className="h-10 rounded-sm">
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${
                      category.id === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="ml-2 text-xs opacity-70">({category.count})</span>
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <div
                      key={template.id}
                      className="group relative flex flex-col h-96 rounded-sm border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      {/* Featured Badge */}
                      {template.featured && (
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-500/10 border border-amber-500/20">
                            <Star className="h-3 w-3 text-amber-600 fill-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Featured</span>
                          </div>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="mb-4">
                        <div className="inline-flex p-3 rounded-sm bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      {/* Content - grows to fill space */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 font-(family-name:--font-general-sans)">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        {/* Jurisdictions - fixed height container */}
                        <div className="flex flex-wrap gap-1 mb-3 min-h-7">
                          {template.jurisdictions.map((jurisdiction, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-xs h-fit"
                            >
                              {jurisdiction}
                            </span>
                          ))}
                        </div>

                        {/* Stats - pushed to bottom of flex container */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span>{template.popularity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{template.usageCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions - always at bottom */}
                      <div className="flex gap-2">
                        <Button className="flex-1 h-9 rounded-sm text-sm">
                          Use Template
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Load More */}
              <div className="mt-8 text-center">
                <Button variant="outline" className="h-10 rounded-sm">
                  Load More Templates
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
