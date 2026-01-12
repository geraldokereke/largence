"use client";

import { useState, useEffect } from "react";
import { useOrganization, useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@largence/components/ui/button";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shield,
  PenTool,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Chart colors
const CHART_COLORS = {
  primary: "#0d9488",
  secondary: "#10b981",
  accent: "#06b6d4",
  emerald: "#10b981",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  amber: "#f59e0b",
  slate: "#64748b",
  cyan: "#22d3ee",
};

const PIE_COLORS = ["#0d9488", "#06b6d4", "#14b8a6", "#22d3ee", "#64748b"];

// Types for transformed data
interface ChartData {
  overview: {
    totalDocuments: number;
    documentsThisMonth: number;
    documentsChange: number;
    aiGenerations: number;
    aiGenerationsChange: number;
    complianceChecks: number;
    complianceRate: number;
    signaturesSent: number;
    signaturesCompleted: number;
  };
  documentsOverTime: { month: string; created: number; finalized: number }[];
  documentsByType: { name: string; value: number; fill: string }[];
  documentsByStatus: { name: string; value: number; fill: string }[];
}

// Static mock data for when API fails or for demo
const STATIC_MOCK_DATA: ChartData = {
  overview: {
    totalDocuments: 247,
    documentsThisMonth: 34,
    documentsChange: 12,
    aiGenerations: 89,
    aiGenerationsChange: 24,
    complianceChecks: 156,
    complianceRate: 94,
    signaturesSent: 67,
    signaturesCompleted: 54,
  },
  documentsOverTime: [
    { month: "Aug", created: 28, finalized: 22 },
    { month: "Sep", created: 35, finalized: 28 },
    { month: "Oct", created: 42, finalized: 35 },
    { month: "Nov", created: 38, finalized: 32 },
    { month: "Dec", created: 45, finalized: 38 },
    { month: "Jan", created: 34, finalized: 26 },
  ],
  documentsByType: [
    { name: "Contracts", value: 89, fill: PIE_COLORS[0] },
    { name: "NDAs", value: 67, fill: PIE_COLORS[1] },
    { name: "Agreements", value: 45, fill: PIE_COLORS[2] },
    { name: "Policies", value: 28, fill: PIE_COLORS[3] },
    { name: "Other", value: 18, fill: PIE_COLORS[4] },
  ],
  documentsByStatus: [
    { name: "Finalized", value: 156, fill: CHART_COLORS.emerald },
    { name: "Draft", value: 67, fill: CHART_COLORS.amber },
    { name: "In Review", value: 18, fill: CHART_COLORS.blue },
    { name: "Archived", value: 6, fill: CHART_COLORS.slate },
  ],
};

// Transform API data to chart format
function transformApiData(apiData: any): ChartData {
  // If no data, return mock
  if (!apiData) return STATIC_MOCK_DATA;

  try {
    // Transform documentsOverTime from Nivo format to Recharts format
    let documentsOverTime = STATIC_MOCK_DATA.documentsOverTime;
    
    if (apiData.documentsByMonth && Array.isArray(apiData.documentsByMonth)) {
      // Use documentsByMonth if available (already in right format)
      documentsOverTime = apiData.documentsByMonth.map((item: any) => ({
        month: item.month || "Unknown",
        created: item.created || 0,
        finalized: item.finalized || item.completed || 0,
      }));
    } else if (apiData.documentsOverTime && Array.isArray(apiData.documentsOverTime)) {
      // Transform from Nivo line chart format
      const createdData = apiData.documentsOverTime.find((s: any) => s.id === "Created")?.data || [];
      const completedData = apiData.documentsOverTime.find((s: any) => s.id === "Completed")?.data || [];
      
      const months = createdData.map((d: any) => d.x);
      documentsOverTime = months.map((month: string, i: number) => ({
        month,
        created: createdData[i]?.y || 0,
        finalized: completedData[i]?.y || 0,
      }));
    }

    // Transform documentsByType
    let documentsByType = STATIC_MOCK_DATA.documentsByType;
    if (apiData.documentsByType && Array.isArray(apiData.documentsByType)) {
      documentsByType = apiData.documentsByType.map((item: any, index: number) => ({
        name: item.label || item.name || "Unknown",
        value: item.value || 0,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }));
    }

    // Transform documentsByStatus
    let documentsByStatus = STATIC_MOCK_DATA.documentsByStatus;
    if (apiData.documentsByStatus && Array.isArray(apiData.documentsByStatus)) {
      const statusColors: Record<string, string> = {
        finalized: CHART_COLORS.emerald,
        completed: CHART_COLORS.emerald,
        signed: CHART_COLORS.emerald,
        draft: CHART_COLORS.amber,
        pending: CHART_COLORS.amber,
        review: CHART_COLORS.blue,
        archived: CHART_COLORS.slate,
      };
      documentsByStatus = apiData.documentsByStatus.map((item: any) => ({
        name: item.label || item.name || "Unknown",
        value: item.value || 0,
        fill: statusColors[item.id?.toLowerCase()] || item.color || CHART_COLORS.slate,
      }));
    }

    // Get overview data
    const overview = apiData.overview || STATIC_MOCK_DATA.overview;

    return {
      overview: {
        totalDocuments: overview.totalDocuments || 0,
        documentsThisMonth: overview.documentsThisMonth || 0,
        documentsChange: Math.round(overview.documentsChange || 0),
        aiGenerations: overview.aiGenerations || 0,
        aiGenerationsChange: Math.round(overview.aiGenerationsChange || 0),
        complianceChecks: overview.complianceChecks || 0,
        complianceRate: Math.round(overview.complianceRate || 0),
        signaturesSent: overview.signaturesSent || 0,
        signaturesCompleted: overview.signaturesCompleted || 0,
      },
      documentsOverTime,
      documentsByType,
      documentsByStatus,
    };
  } catch (error) {
    console.error("Error transforming analytics data:", error);
    return STATIC_MOCK_DATA;
  }
}

async function fetchAnalytics(range: string): Promise<ChartData> {
  const response = await fetch(`/api/analytics?range=${range}`);
  if (!response.ok) throw new Error("Failed to fetch analytics");
  const apiData = await response.json();
  return transformApiData(apiData);
}

// Custom Tooltip Component
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="rounded-md border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-popover-foreground mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div 
            className="h-2 w-2 rounded-full" 
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-popover-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Pie Chart Tooltip
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  
  return (
    <div className="rounded-md border bg-popover px-3 py-2">
      <p className="text-xs font-medium text-popover-foreground">{data.name}</p>
      <p className="text-xs text-muted-foreground">{data.value} documents</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { organization } = useOrganization();
  const { userId } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [mounted, setMounted] = useState(false);

  // Handle hydration - only render charts after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics", timeRange, organization?.id],
    queryFn: () => fetchAnalytics(timeRange),
    enabled: !!userId && mounted,
    staleTime: 1000 * 60 * 5,
  });

  // Use transformed data or static mock while loading
  const chartData = data || STATIC_MOCK_DATA;

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h2 className="text-base font-semibold mb-1">Failed to load analytics</h2>
          <p className="text-sm text-muted-foreground mb-3">
            There was an error loading your analytics data.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-sm h-8">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!mounted || isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold font-display">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your document performance and usage metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[130px] h-8 text-xs rounded-sm">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards - Only 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.overview.totalDocuments}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {chartData.overview.documentsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={chartData.overview.documentsChange >= 0 ? "text-emerald-500" : "text-red-500"}>
                {chartData.overview.documentsChange >= 0 ? "+" : ""}{chartData.overview.documentsChange}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.overview.aiGenerations}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {chartData.overview.aiGenerationsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={chartData.overview.aiGenerationsChange >= 0 ? "text-emerald-500" : "text-red-500"}>
                {chartData.overview.aiGenerationsChange >= 0 ? "+" : ""}{chartData.overview.aiGenerationsChange}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Compliance Checks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.overview.complianceChecks}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">{chartData.overview.complianceRate}%</span>
              <span className="ml-1">compliance rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">E-Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.overview.signaturesSent}</div>
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">{chartData.overview.signaturesCompleted}</span>
              <span className="ml-1">completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-3 lg:grid-cols-7">
        {/* Documents Over Time - Area Chart */}
        <Card className="rounded-sm lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents Over Time</CardTitle>
            <CardDescription className="text-xs">
              Created vs finalized documents by month
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData.documentsOverTime} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradientCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientFinalized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#gradientCreated)"
                  />
                  <Area
                    type="monotone"
                    dataKey="finalized"
                    name="Finalized"
                    stroke={CHART_COLORS.emerald}
                    strokeWidth={2}
                    fill="url(#gradientFinalized)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Documents by Type - Pie Chart */}
        <Card className="rounded-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents by Type</CardTitle>
            <CardDescription className="text-xs">
              Distribution by document category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.documentsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.documentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {chartData.documentsByType.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div 
                    className="h-2.5 w-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Documents by Status - Horizontal Bar Chart */}
        <Card className="rounded-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents by Status</CardTitle>
            <CardDescription className="text-xs">
              Current document status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData.documentsByStatus} 
                  layout="vertical" 
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Documents" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {chartData.documentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="rounded-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Summary</CardTitle>
            <CardDescription className="text-xs">
              Key metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-4">
              <MetricBar 
                label="Documents this month" 
                value={chartData.overview.documentsThisMonth}
                max={50}
                color="bg-primary"
              />
              <MetricBar 
                label="AI utilization rate" 
                value={chartData.overview.totalDocuments > 0 
                  ? Math.round((chartData.overview.aiGenerations / chartData.overview.totalDocuments) * 100)
                  : 0}
                max={100}
                suffix="%"
                color="bg-violet-500"
              />
              <MetricBar 
                label="Signature completion" 
                value={chartData.overview.signaturesSent > 0
                  ? Math.round((chartData.overview.signaturesCompleted / chartData.overview.signaturesSent) * 100)
                  : 0}
                max={100}
                suffix="%"
                color="bg-emerald-500"
              />
              <MetricBar 
                label="Compliance rate" 
                value={chartData.overview.complianceRate}
                max={100}
                suffix="%"
                color="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Metric Bar Component
function MetricBar({ 
  label, 
  value, 
  max, 
  suffix = "", 
  color 
}: { 
  label: string; 
  value: number; 
  max: number; 
  suffix?: string;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Skeleton Loading State
function AnalyticsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-3">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-[130px]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-7">
        <Card className="rounded-sm lg:col-span-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="rounded-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
