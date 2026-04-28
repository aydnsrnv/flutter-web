import Link from "next/link";
import { getDashboardStats } from "../actions";
import { StatCard } from "../components/stat-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Overview of your platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Users" value={stats.counts.users} icon="ri-user-line" color="primary" />
        <StatCard title="Jobs" value={stats.counts.jobs} icon="ri-briefcase-line" color="success" />
        <StatCard title="Resumes" value={stats.counts.resumes} icon="ri-file-list-line" color="warning" />
        <StatCard title="Companies" value={stats.counts.companies} icon="ri-building-line" color="primary" />
        <StatCard title="Categories" value={stats.counts.categories} icon="ri-stack-line" color="success" />
        <StatCard title="Reports" value={stats.counts.reports} icon="ri-flag-line" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Recent Jobs
            </h2>
            <Link
              href="/admin/jobs"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--jobly-main)" }}
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentJobs.length === 0 && (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No jobs yet
              </p>
            )}
            {stats.recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <span className="text-sm font-medium truncate max-w-[70%]" style={{ color: "var(--foreground)" }}>
                  {job.title}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {job.create_time ? new Date(job.create_time).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Recent Resumes
            </h2>
            <Link
              href="/admin/resumes"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--jobly-main)" }}
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentResumes.length === 0 && (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No resumes yet
              </p>
            )}
            {stats.recentResumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <span className="text-sm font-medium truncate max-w-[70%]" style={{ color: "var(--foreground)" }}>
                  {resume.full_name}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {resume.create_time ? new Date(resume.create_time).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
