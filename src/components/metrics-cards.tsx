import { FileText, Clock, AlertCircle, ShieldCheck } from "lucide-react"

const metrics = [
  {
    title: "Active Documents",
    value: "234",
    label: "Active",
    icon: FileText,
    trend: "+12 from last month",
    trendUp: true,
  },
  {
    title: "Pending Approvals",
    value: "12",
    label: "Pending",
    icon: Clock,
    trend: "3 urgent",
    trendUp: false,
  },
  {
    title: "Expiring Contracts",
    value: "8",
    label: "This Month",
    icon: AlertCircle,
    trend: "2 within 7 days",
    trendUp: false,
  },
  {
    title: "Compliance Score",
    value: "92%",
    label: "Compliant",
    icon: ShieldCheck,
    trend: "+5% this quarter",
    trendUp: true,
  },
]

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.title}
            className="rounded-sm border bg-card p-6 hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-sm bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-semibold tracking-tight font-heading">
                  {metric.value}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <p className={`text-xs ${metric.trendUp ? "text-emerald-600" : "text-amber-600"}`}>
                {metric.trend}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
