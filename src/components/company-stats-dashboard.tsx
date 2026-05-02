"use client";


import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { StatsCard } from "@/components/ui/stats-card";
import { useI18n } from "@/lib/i18n/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Eye,
  UserTick,
  TrendUp,
  Briefcase,
  Map1,
  Money,
  Award,
} from "iconsax-react";

interface CompanyStatsDashboardProps {
  jobs: FlutterJobItemData[];
  totalViews: number;
  totalApplied: number;
  jobsCount: number;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

function formatNumber(n: number) {
  if (n < 1000) return String(Math.round(n));
  if (n < 10000) return String(Math.round(n));
  const inK = n / 1000;
  const isExact = n % 1000 === 0;
  return `${isExact ? inK.toFixed(0) : inK.toFixed(1)}k`;
}

function getLast30DaysLabels() {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    days.push(`${day}.${month}`);
  }
  return days;
}

export function CompanyStatsDashboard({
  jobs,
  totalViews,
  totalApplied,
  jobsCount,
}: CompanyStatsDashboardProps) {
  const { t } = useI18n();

  const avgViewsPerJob = jobsCount > 0 ? totalViews / jobsCount : 0;
  const avgAppliedPerJob = jobsCount > 0 ? totalApplied / jobsCount : 0;
  const conversionRate =
    totalViews > 0 ? Math.round((totalApplied / totalViews) * 1000) / 10 : 0;

  const labels = getLast30DaysLabels();
  const counts: Record<string, number> = {};
  for (const label of labels) counts[label] = 0;

  for (const job of jobs) {
    if (!job.create_time) continue;
    const d = new Date(job.create_time);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${day}.${month}`;
    if (counts[key] !== undefined) counts[key]++;
  }

  const dailyData = labels.map((label) => ({ name: label, count: counts[label] }));

  const cityCounts: Record<string, number> = {};
  for (const job of jobs) {
    if (!job.city) continue;
    const cityLabel = t(job.city) !== job.city ? t(job.city) : job.city;
    cityCounts[cityLabel] = (cityCounts[cityLabel] || 0) + 1;
  }
  const cityData = Object.entries(cityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ranges: Record<string, number> = {
    "0-500": 0,
    "500-1000": 0,
    "1000-1500": 0,
    "1500-2000": 0,
    "2000-3000": 0,
    "3000+": 0,
  };

  for (const job of jobs) {
    const min = Number(job.min_salary) || 0;
    const max = Number(job.max_salary) || 0;
    const val = max > 0 ? max : min;
    if (val <= 0) continue;

    if (val <= 500) ranges["0-500"]++;
    else if (val <= 1000) ranges["500-1000"]++;
    else if (val <= 1500) ranges["1000-1500"]++;
    else if (val <= 2000) ranges["1500-2000"]++;
    else if (val <= 3000) ranges["2000-3000"]++;
    else ranges["3000+"]++;
  }

  const salaryData = Object.entries(ranges)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const topJobsByViews = [...jobs]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  const topJobsByApplied = [...jobs]
    .sort((a, b) => (b.applied_count || 0) - (a.applied_count || 0))
    .slice(0, 5);

  const hasJobs = jobsCount > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          title={t("stat_view")}
          value={formatNumber(totalViews)}
          icon={<Eye size={20} variant="Linear" />}
          variant="primary"
        />
        <StatsCard
          title={t("stat_applied")}
          value={formatNumber(totalApplied)}
          icon={<UserTick size={20} variant="Linear" />}
          variant="success"
        />
        <StatsCard
          title={t("company_stats_jobs")}
          value={formatNumber(jobsCount)}
          icon={<Briefcase size={20} variant="Linear" />}
          variant="warning"
        />
        <StatsCard
          title={t("conversion_rate") || "Conversion"}
          value={`%${conversionRate}`}
          subtitle={`${formatNumber(avgAppliedPerJob)} ${t("per_job") || "per job"}`}
          icon={<TrendUp size={20} variant="Linear" />}
          variant="default"
        />
      </div>

      {/* Average cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title={t("avg_views_per_job") || "Avg. Views/Job"}
          value={formatNumber(avgViewsPerJob)}
          icon={<Eye size={20} variant="Linear" />}
          variant="default"
        />
        <StatsCard
          title={t("avg_applied_per_job") || "Avg. Applied/Job"}
          value={formatNumber(avgAppliedPerJob)}
          icon={<UserTick size={20} variant="Linear" />}
          variant="default"
        />
      </div>

      {/* Charts */}
      {hasJobs && (
        <div className="flex flex-col gap-4">
          {/* Daily jobs trend */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase size={20} variant="Linear" className="text-primary" />
              <div className="text-base font-semibold text-foreground">
                {t("jobs_posting_trend") || "Job Posting Trend (Last 30 Days)"}
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 13,
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* City Distribution */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center gap-2">
                <Map1 size={20} variant="Linear" className="text-primary" />
                <div className="text-base font-semibold text-foreground">
                  {t("city_distribution") || "Jobs by City"}
                </div>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {cityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: 13,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Salary Distribution */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center gap-2">
                <Money size={20} variant="Linear" className="text-primary" />
                <div className="text-base font-semibold text-foreground">
                  {t("salary_distribution") || "Salary Distribution"}
                </div>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {salaryData.map((_, index) => (
                        <Cell key={`salary-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Eye size={20} variant="Linear" className="text-primary" />
                <div className="text-base font-semibold text-foreground">
                  {t("top_viewed_jobs") || "Most Viewed Jobs"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {topJobsByViews.map((job, i) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {job.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{job.city}</div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-primary">
                      {formatNumber(job.view_count || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Award size={20} variant="Linear" className="text-primary" />
                <div className="text-base font-semibold text-foreground">
                  {t("top_applied_jobs") || "Most Applied Jobs"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {topJobsByApplied.map((job, i) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {job.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{job.city}</div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-emerald-600">
                      {formatNumber(job.applied_count || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
