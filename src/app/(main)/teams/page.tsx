import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { 
  Users, 
  Search,
  Filter,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  UserCheck,
  TrendingUp,
  FileText,
  Clock,
  Award
} from "lucide-react"

const stats = [
  {
    label: "Total Members",
    value: "24",
    change: "+3 this month",
    trend: "up",
    icon: Users,
  },
  {
    label: "Active Projects",
    value: "12",
    change: "+2 this week",
    trend: "up",
    icon: FileText,
  },
  {
    label: "Avg. Response Time",
    value: "2.4h",
    change: "-0.3h improved",
    trend: "up",
    icon: Clock,
  },
  {
    label: "Team Performance",
    value: "94%",
    change: "+5% this quarter",
    trend: "up",
    icon: Award,
  },
]

const teams = [
  {
    id: 1,
    name: "Legal Operations",
    description: "Core legal team managing contracts, compliance, and corporate governance",
    members: 8,
    activeProjects: 5,
    lead: {
      name: "Adewale Johnson",
      avatar: "AJ",
      email: "adewale.j@largence.com",
    },
    color: "emerald",
    recentActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Compliance & Risk",
    description: "Regulatory compliance, risk assessment, and audit management across African markets",
    members: 6,
    activeProjects: 3,
    lead: {
      name: "Chioma Okonkwo",
      avatar: "CO",
      email: "chioma.o@largence.com",
    },
    color: "blue",
    recentActivity: "5 hours ago",
  },
  {
    id: 3,
    name: "Corporate Governance",
    description: "Board resolutions, shareholder agreements, and corporate structure documentation",
    members: 5,
    activeProjects: 4,
    lead: {
      name: "Kwame Mensah",
      avatar: "KM",
      email: "kwame.m@largence.com",
    },
    color: "purple",
    recentActivity: "1 day ago",
  },
  {
    id: 4,
    name: "International Trade",
    description: "Cross-border agreements, trade compliance, and international contract negotiations",
    members: 5,
    activeProjects: 2,
    lead: {
      name: "Fatima Hassan",
      avatar: "FH",
      email: "fatima.h@largence.com",
    },
    color: "amber",
    recentActivity: "3 hours ago",
  },
]

const teamMembers = [
  {
    id: 1,
    name: "Adewale Johnson",
    avatar: "AJ",
    role: "Team Lead",
    email: "adewale.j@largence.com",
    team: "Legal Operations",
    status: "active",
    joined: "Jan 2024",
    documentsProcessed: 156,
  },
  {
    id: 2,
    name: "Chioma Okonkwo",
    avatar: "CO",
    role: "Team Lead",
    email: "chioma.o@largence.com",
    team: "Compliance & Risk",
    status: "active",
    joined: "Feb 2024",
    documentsProcessed: 142,
  },
  {
    id: 3,
    name: "Kwame Mensah",
    avatar: "KM",
    role: "Team Lead",
    email: "kwame.m@largence.com",
    team: "Corporate Governance",
    status: "active",
    joined: "Mar 2024",
    documentsProcessed: 128,
  },
  {
    id: 4,
    name: "Fatima Hassan",
    avatar: "FH",
    role: "Team Lead",
    email: "fatima.h@largence.com",
    team: "International Trade",
    status: "active",
    joined: "Jan 2024",
    documentsProcessed: 134,
  },
  {
    id: 5,
    name: "Thabo Ndlovu",
    avatar: "TN",
    role: "Senior Associate",
    email: "thabo.n@largence.com",
    team: "Legal Operations",
    status: "active",
    joined: "Apr 2024",
    documentsProcessed: 98,
  },
  {
    id: 6,
    name: "Amara Diallo",
    avatar: "AD",
    role: "Legal Analyst",
    email: "amara.d@largence.com",
    team: "Compliance & Risk",
    status: "away",
    joined: "May 2024",
    documentsProcessed: 76,
  },
]

const getColorClasses = (color: string) => {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.emerald
}

export default function TeamsPage() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold font-display">
              Teams
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage teams, members, and collaborate on legal work across your organization
            </p>
          </div>
          <Button className="h-10 rounded-sm">
            <Plus className="h-5 w-5" />
            Create Team
          </Button>
        </div>
              </div>

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
                        <p className="text-3xl font-semibold font-heading">
                          {stat.value}
                        </p>
                        <p className="text-xs text-emerald-600">{stat.change}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams or members..."
                    className="h-10 rounded-sm pl-9"
                  />
                </div>
                <Button variant="outline" className="h-10 rounded-sm">
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 font-heading">
                  Active Teams
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="group flex flex-col h-64 rounded-sm border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`px-2 py-1 rounded-sm border text-xs font-medium ${getColorClasses(team.color)}`}>
                              {team.members} members
                            </div>
                            <div className="px-2 py-1 rounded-sm bg-muted text-xs">
                              {team.activeProjects} active
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold font-heading">
                            {team.name}
                          </h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {team.description}
                      </p>

                      <div className="flex items-center gap-3 mb-4 mt-auto">
                        <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary font-semibold text-sm">
                          {team.lead.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{team.lead.name}</p>
                            <Crown className="h-3 w-3 text-amber-600 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{team.lead.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{team.recentActivity}</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 rounded-sm text-xs">
                          View Team
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 font-heading">
                  Team Members
                </h2>
                <div className="rounded-sm border bg-card">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                    <div className="col-span-3">Member</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-3">Team</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Docs</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="divide-y">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/5 transition-colors"
                      >
                        {/* Member */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary font-semibold text-sm shrink-0">
                            {member.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-2">
                            {member.role === "Team Lead" ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{member.role}</span>
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center">
                          <span className="text-sm text-muted-foreground">{member.team}</span>
                        </div>

                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              member.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                            }`} />
                            <span className="text-sm capitalize">{member.status}</span>
                          </div>
                        </div>

                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-medium">{member.documentsProcessed}</span>
                        </div>

                        <div className="col-span-1 flex items-center justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">6</span> of <span className="font-medium">24</span> members
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
            </div>
  )
}
