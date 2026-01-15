"use client";

import { FileText, Clock, CheckCircle, TrendingUp, Activity } from "lucide-react";

interface QuickStatsProps {
  documents: {
    id: string;
    status: "DRAFT" | "FINAL" | "ARCHIVED";
    updatedAt: string;
  }[];
}

export function QuickStats({ documents }: QuickStatsProps) {
  const totalDocs = documents.length;
  const draftCount = documents.filter((d) => d.status === "DRAFT").length;
  const finalCount = documents.filter((d) => d.status === "FINAL").length;
  
  // Documents updated in last 7 days
  const recentlyUpdated = documents.filter((d) => {
    const updatedDate = new Date(d.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updatedDate > weekAgo;
  }).length;

  // Documents updated today
  const updatedToday = documents.filter((d) => {
    const updatedDate = new Date(d.updatedAt);
    const today = new Date();
    return updatedDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      label: "Total Documents",
      value: totalDocs,
      change: `${updatedToday} updated today`,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Drafts",
      value: draftCount,
      change: "In progress",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Finalized",
      value: finalCount,
      change: "Completed",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Updated This Week",
      value: recentlyUpdated,
      change: `${updatedToday} today`,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-sm border bg-card p-4 hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-1.5 rounded-sm ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold font-heading">{stat.value}</p>
              <p className="text-xs text-emerald-600">{stat.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
