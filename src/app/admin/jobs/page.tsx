import Link from "next/link";
import { getJobs, getAllCompanies, updateJob, toggleJobPremium, deleteJob } from "../actions";
import { SearchInput } from "../components/search-input";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";
import { JobFormClient } from "./job-form-client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const search = q ?? "";

  const [companies, { data: jobs, total }] = await Promise.all([
    getAllCompanies(),
    getJobs({
    page: currentPage,
    limit: 20,
    search,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Jobs
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {total} total jobs
          </p>
        </div>
        <SearchInput placeholder="Search jobs..." />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Title</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Company</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>City</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Type</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Views</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Applied</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Premium</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Premium Until</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job: any) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>
                      {job.title}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {job.companies?.company_name || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {job.city || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {job.job_type || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {job.view_count ?? 0}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {job.applied_count ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {job.is_premium ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(245,158,11,0.12)] px-2.5 py-1 text-xs font-semibold text-[#d97706]">
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(107,114,128,0.12)] px-2.5 py-1 text-xs font-semibold text-gray-500">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {job.premium_end ? new Date(job.premium_end).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {job.create_time ? new Date(job.create_time).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/job/${job.id}`}
                        target="_blank"
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(36,91,235,0.12)] text-[#245beb]"
                      >
                        View
                      </Link>
                      <JobFormClient job={job} companies={companies} action={updateJob} />
                      <form
                        action={async () => {
                          "use server";
                          await toggleJobPremium(job.id, !job.is_premium);
                        }}
                      >
                        <button
                          type="submit"
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold",
                            job.is_premium
                              ? "bg-[rgba(107,114,128,0.12)] text-gray-500"
                              : "bg-[rgba(245,158,11,0.12)] text-[#d97706]"
                          )}
                        >
                          {job.is_premium ? "Remove Premium" : "Make Premium"}
                        </button>
                      </form>
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                          >
                            Delete
                          </button>
                        }
                        title="Delete Job"
                        description={`Are you sure you want to delete "${job.title}"? This action cannot be undone.`}
                        onConfirm={async () => {
                          "use server";
                          await deleteJob(job.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {jobs.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No jobs found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
