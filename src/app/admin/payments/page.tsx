import { getPayments } from "../actions";
import { PaginationControls } from "../components/pagination-controls";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));

  const { data: payments, total } = await getPayments({
    page: currentPage,
    limit: 20,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Payments
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {total} total payments
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>User</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Email</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Amount</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Transaction</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {payment.user_id || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                    {payment.user_email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ color: "var(--jobly-main)" }}>
                      {payment.amount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {payment.transaction_code ? String(payment.transaction_code) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No payments found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />
    </div>
  );
}
