import { getCategories, createCategory, updateCategory, deleteCategory } from "../actions";
import { SearchInput } from "../components/search-input";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";
import { CategoryFormClient } from "./category-form-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const search = q ?? "";

  const { data: categories, total } = await getCategories({
    page: currentPage,
    limit: 20,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Categories
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {total} total categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search categories..." />
          <CategoryFormClient mode="create" action={createCategory} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Display Name</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Category Key</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>List ID</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Jobs</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>
                      {cat.display_name || cat.category_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {cat.category_name}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {cat.list_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {cat.job_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CategoryFormClient
                        mode="edit"
                        category={cat}
                        action={updateCategory}
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
                        title="Delete Category"
                        description={`Are you sure you want to delete "${cat.display_name || cat.category_name}"? This action cannot be undone.`}
                        onConfirm={async () => {
                          "use server";
                          await deleteCategory(cat.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No categories found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
