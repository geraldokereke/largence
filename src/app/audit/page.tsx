import { AppSidebar } from "@largence/components/app-sidebar"
import { SiteHeader } from "@largence/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@largence/components/ui/sidebar"
import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { 
  ShieldCheck, 
  Search,
  Filter,
  Download,
  FileText,
  TrendingUp,
  Edit,
  Check,
  UserPlus,
  Upload,
  Eye,
  Activity,
  Users,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Bot,
  Archive,
  Send,
} from "lucide-react"

const stats = [
  {
    label: "Events This Week",
    value: "1,247",
    change: "+18% from last week",
    icon: Activity,
  },
  {
    label: "Active Users",
    value: "24",
    change: "+3 new members",
    icon: Users,
  },
  {
    label: "Documents Modified",
    value: "156",
    change: "12 today",
    icon: FileText,
  },
  {
    label: "Compliance Checks",
    value: "89",
    change: "Last: 2 hours ago",
    icon: ShieldCheck,
  },
]

const eventTypes = [
  { id: "all", name: "All Events", count: 1247 },
  { id: "document", name: "Document", count: 456 },
  { id: "approval", name: "Approval", count: 234 },
  { id: "compliance", name: "Compliance", count: 189 },
  { id: "user", name: "User", count: 156 },
  { id: "system", name: "System", count: 212 },
]

const auditLogs = [
  {
    id: 1,
    timestamp: "2025-10-30T14:23:00",
    user: { name: "Ada Nwosu", avatar: "AN", type: "user" },
    actionLabel: "Approved",
    entityName: "NDA Agreement #234",
    metadata: { previousStatus: "Pending Review", newStatus: "Approved" },
    ipAddress: "102.89.12.45",
    location: "Lagos, Nigeria",
    device: "Desktop - Chrome",
    icon: Check,
    iconColor: "text-emerald-600 bg-emerald-500/10",
  },
  {
    id: 2,
    timestamp: "2025-10-30T13:58:00",
    user: { name: "Compliance AI", avatar: "AI", type: "system" },
    actionLabel: "Compliance Check",
    entityName: "Employee Privacy Policy",
    metadata: { regulation: "NDPR", score: 100 },
    ipAddress: "System",
    location: "Automated",
    device: "System",
    icon: ShieldCheck,
    iconColor: "text-blue-600 bg-blue-500/10",
  },
  {
    id: 3,
    timestamp: "2025-10-29T17:12:00",
    user: { name: "Chidi Okoro", avatar: "CO", type: "user" },
    actionLabel: "Edited Clause",
    entityName: "Offer Letter - Senior Developer",
    metadata: { clause: "Clause 4: Non-compete", oldValue: "12 months", newValue: "6 months" },
    ipAddress: "41.58.6.102",
    location: "Accra, Ghana",
    device: "Desktop - Firefox",
    icon: Edit,
    iconColor: "text-amber-600 bg-amber-500/10",
  },
  {
    id: 4,
    timestamp: "2025-10-29T15:45:00",
    user: { name: "Fatima Hassan", avatar: "FH", type: "user" },
    actionLabel: "Uploaded",
    entityName: "Cross-Border Data Transfer Agreement",
    metadata: { fileSize: "2.4 MB" },
    ipAddress: "197.156.89.23",
    location: "Cairo, Egypt",
    device: "Mobile - Safari",
    icon: Upload,
    iconColor: "text-purple-600 bg-purple-500/10",
  },
  {
    id: 5,
    timestamp: "2025-10-29T14:22:00",
    user: { name: "Kwame Mensah", avatar: "KM", type: "user" },
    actionLabel: "Created",
    entityName: "Board Resolution - Q4 2025",
    metadata: { template: "Board Resolution Template", jurisdiction: "Ghana" },
    ipAddress: "154.160.12.98",
    location: "Kumasi, Ghana",
    device: "Desktop - Chrome",
    icon: FileText,
    iconColor: "text-primary bg-primary/10",
  },
  {
    id: 6,
    timestamp: "2025-10-29T11:18:00",
    user: { name: "Compliance AI", avatar: "AI", type: "system" },
    actionLabel: "Auto Backup",
    entityName: "Database Backup Completed",
    metadata: { backupSize: "4.2 GB" },
    ipAddress: "System",
    location: "Automated",
    device: "System",
    icon: Archive,
    iconColor: "text-slate-600 bg-slate-500/10",
  },
  {
    id: 7,
    timestamp: "2025-10-29T09:34:00",
    user: { name: "Adewale Johnson", avatar: "AJ", type: "user" },
    actionLabel: "Invited User",
    entityName: "thabo.ndlovu@company.com",
    metadata: { role: "Legal Analyst", team: "Legal Operations" },
    ipAddress: "102.89.45.123",
    location: "Lagos, Nigeria",
    device: "Desktop - Edge",
    icon: UserPlus,
    iconColor: "text-emerald-600 bg-emerald-500/10",
  },
  {
    id: 8,
    timestamp: "2025-10-28T16:55:00",
    user: { name: "Chioma Okonkwo", avatar: "CO", type: "user" },
    actionLabel: "Sent for Signature",
    entityName: "Employment Contract - Marketing Manager",
    metadata: { recipients: "candidate@email.com, hr@company.com" },
    ipAddress: "105.112.23.45",
    location: "Abuja, Nigeria",
    device: "Desktop - Chrome",
    icon: Send,
    iconColor: "text-blue-600 bg-blue-500/10",
  },
]

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000)
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffHours < 168) return `${Math.floor(diffHours / 24)} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getDeviceIcon = (device: string) => {
  if (device === "System") return Bot
  if (device.includes("Mobile")) return Smartphone
  return Monitor
}

export default function AuditPage() {
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
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-semibold font-(family-name:--font-general-sans)">
                      Audit Trail
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete activity log tracking who did what, when, and where across your organization
                    </p>
                  </div>
                  <Button variant="outline" className="h-10 rounded-sm">
                    <Download className="h-5 w-5" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="rounded-sm border bg-card p-6 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-sm bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-semibold font-(family-name:--font-general-sans)">
                          {stat.value}
                        </p>
                        <p className="text-xs text-emerald-600">{stat.change}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, action, document, or IP address..."
                    className="h-10 rounded-sm pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-10 rounded-sm">
                    <Calendar className="h-5 w-5" />
                    Date Range
                  </Button>
                  <Button variant="outline" className="h-10 rounded-sm">
                    <Filter className="h-5 w-5" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Event Type Filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {eventTypes.map((type, index) => (
                  <button
                    key={type.id}
                    className={`px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${
                      index === 0
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="ml-2 text-xs opacity-70">({type.count})</span>
                  </button>
                ))}
              </div>

              {/* Audit Trail Timeline */}
              <div className="space-y-3">
                {auditLogs.map((log) => {
                  const Icon = log.icon
                  const DeviceIcon = getDeviceIcon(log.device)
                  return (
                    <div
                      key={log.id}
                      className="group rounded-sm border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-sm ${log.iconColor} shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    {log.user.type === "system" ? (
                                      <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-blue-500/10 text-blue-600">
                                        <Bot className="h-4 w-4" />
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-primary/10 text-primary font-semibold text-xs">
                                        {log.user.avatar}
                                      </div>
                                    )}
                                    <span className="text-sm font-semibold">{log.user.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{log.actionLabel}</span>
                                  <div className="px-2 py-0.5 rounded-sm bg-muted">
                                    <span className="text-xs font-medium">{log.entityName}</span>
                                  </div>
                                </div>
                                {log.metadata && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    {log.metadata.oldValue && (
                                      <div className="flex items-center gap-2">
                                        <span className="line-through text-red-600">{log.metadata.oldValue}</span>
                                        <span>→</span>
                                        <span className="text-emerald-600">{log.metadata.newValue}</span>
                                      </div>
                                    )}
                                    {log.metadata.previousStatus && (
                                      <span>
                                        Status: <span className="text-amber-600">{log.metadata.previousStatus}</span> → <span className="text-emerald-600">{log.metadata.newStatus}</span>
                                      </span>
                                    )}
                                    {log.metadata.regulation && (
                                      <span>{log.metadata.regulation} • Score: {log.metadata.score}%</span>
                                    )}
                                    {log.metadata.template && (
                                      <span>Template: {log.metadata.template} • {log.metadata.jurisdiction}</span>
                                    )}
                                    {log.metadata.role && (
                                      <span>Role: {log.metadata.role} • Team: {log.metadata.team}</span>
                                    )}
                                    {log.metadata.recipients && (
                                      <span>Recipients: {log.metadata.recipients}</span>
                                    )}
                                    {log.metadata.fileSize && (
                                      <span>File size: {log.metadata.fileSize}</span>
                                    )}
                                    {log.metadata.backupSize && (
                                      <span>Backup size: {log.metadata.backupSize}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                <span>{log.ipAddress}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Globe className="h-3 w-3" />
                                <span>{log.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DeviceIcon className="h-3 w-3" />
                                <span>{log.device}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto h-7 rounded-sm text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-3 w-3" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">8</span> of <span className="font-medium">1,247</span> events
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
