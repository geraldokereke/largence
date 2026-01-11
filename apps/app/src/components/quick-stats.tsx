"use client";

import { FileText, Clock, CheckCircle, Archive, TrendingUp } from "lucide-react";

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
  const archivedCount = documents.filter((d) => d.status === "ARCHIVED").length;
  
  // Documents updated in last 7 days
  const recentlyUpdated = documents.filter((d) => {
    const updatedDate = new Date(d.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updatedDate > weekAgo;
  }).length;

  const stats = [
    {
      label: "Total Documents",
      value: totalDocs,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-950/50",
    },
    {
      label: "Finalized",
      value: finalCount,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
    },
    {
      label: "Archived",
      value: archivedCount,
      icon: Archive,
      color: "text-slate-500 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-900/50",
    },
    {
      label: "Updated This Week",
      value: recentlyUpdated,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-sm border bg-card p-3 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-sm ${stat.bgColor}`}>
                <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold font-display">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
