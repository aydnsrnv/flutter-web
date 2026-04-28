import { getUsers, updateUserBlock, deleteUser } from "../actions";
import { SearchInput } from "../components/search-input";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const search = q ?? "";

  const { data: users, total } = await getUsers({
    page: currentPage,
    limit: 20,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Users
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {total} total users
          </p>
        </div>
        <SearchInput placeholder="Search users..." />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>User</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Email</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Wallet</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Admin</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Joined</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div
                          className="h-9 w-9 rounded-full grid place-items-center text-sm font-bold text-white"
                          style={{ backgroundColor: "var(--jobly-main)" }}
                        >
                          {(user.full_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>
                        {user.full_name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {user.email}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {user.wallet ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {user.admin ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(36,91,235,0.12)] px-2.5 py-1 text-xs font-semibold text-[#245beb]">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(107,114,128,0.12)] px-2.5 py-1 text-xs font-semibold text-gray-500">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_blocked ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(239,68,68,0.12)] px-2.5 py-1 text-xs font-semibold text-[#dc2626]">
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(34,197,94,0.12)] px-2.5 py-1 text-xs font-semibold text-[#16a34a]">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await updateUserBlock(user.user_id, !user.is_blocked);
                        }}
                      >
                        <button
                          type="submit"
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                            user.is_blocked
                              ? "bg-[rgba(34,197,94,0.12)] text-[#16a34a]"
                              : "bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                          )}
                        >
                          {user.is_blocked ? "Unblock" : "Block"}
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
                        title="Delete User"
                        description={`Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`}
                        onConfirm={async () => {
                          "use server";
                          await deleteUser(user.user_id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No users found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
