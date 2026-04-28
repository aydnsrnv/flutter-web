import { getReports, deleteReport } from "../actions";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));

  const { data: reports, total } = await getReports({
    page: currentPage,
    limit: 20,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {total} total reports
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Report</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Job / Resume</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Reporter</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                      {report.report_about || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {report.job_number ? (
                      <span className="text-xs font-medium rounded-full bg-[rgba(36,91,235,0.12)] px-2 py-1 text-[#245beb]">
                        Job #{String(report.job_number)}
                      </span>
                    ) : report.resume_number ? (
                      <span className="text-xs font-medium rounded-full bg-[rgba(245,158,11,0.12)] px-2 py-1 text-[#d97706]">
                        Resume #{String(report.resume_number)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {report.reporter_id || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                        >
                          Delete
                        </button>
                      }
                      title="Delete Report"
                      description="Are you sure you want to delete this report?"
                      onConfirm={async () => {
                        "use server";
                        await deleteReport(report.id);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No reports found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
