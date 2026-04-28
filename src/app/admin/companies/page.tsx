import { getCompanies, createCompany, updateCompany, deleteCompany } from "../actions";
import { SearchInput } from "../components/search-input";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";
import { CompanyFormClient } from "./company-form-client";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const search = q ?? "";

  const { data: companies, total } = await getCompanies({
    page: currentPage,
    limit: 20,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Companies
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {total} total companies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search companies..." />
          <CompanyFormClient mode="create" action={createCompany} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Company</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Jobs</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>About</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: any) => (
                <tr key={company.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {company.company_logo ? (
                        <img src={company.company_logo} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div
                          className="h-9 w-9 rounded-full grid place-items-center text-sm font-bold text-white"
                          style={{ backgroundColor: "var(--jobly-main)" }}
                        >
                          {(company.company_name?.[0] ?? "?").toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>
                        {company.company_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {company.job_count ?? 0}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                    {company.about || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CompanyFormClient
                        mode="edit"
                        company={company}
                        action={updateCompany}
                      />
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                          >
                            Delete
                          </button>
                        }
                        title="Delete Company"
                        description={`Are you sure you want to delete "${company.company_name}"? This action cannot be undone.`}
                        onConfirm={async () => {
                          "use server";
                          await deleteCompany(company.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {companies.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No companies found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
