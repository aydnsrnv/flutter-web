"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getNotifications, createNotification, deleteNotification } from "../actions";
import { PaginationControls } from "../components/pagination-controls";
import { ConfirmDialog } from "../components/confirm-dialog";

export default function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <NotificationsPageInner searchParams={searchParams} />;
}

function NotificationsPageInner({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [params, setParams] = useState<{ page?: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "", number: "", user_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useState(() => {
    searchParams.then((p) => {
      setParams(p);
      const currentPage = Math.max(1, Number(p.page ?? "1"));
      getNotifications({ page: currentPage, limit: 20 }).then((d) => {
        setData(d);
        setLoading(false);
      });
    });
  });

  if (!params || loading || !data) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { data: notifications, total } = data;

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = { title: form.title.trim() };
      if (form.type.trim()) payload.type = form.type.trim();
      if (form.number.trim()) payload.number = form.number.trim();
      if (form.user_id.trim()) payload.user_id = form.user_id.trim();
      await createNotification(payload);
      setModalOpen(false);
      setForm({ title: "", type: "", number: "", user_id: "" });
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Notifications
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {total} total notifications
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-10 px-4 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ backgroundColor: "var(--jobly-main)" }}
        >
          + Send Notification
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border" style={{ backgroundColor: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Title</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Type</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>User</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Seen</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Date</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n: any) => (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate" style={{ color: "var(--foreground)" }}>
                    {n.title}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {n.type || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {n.user_id || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {n.seen ? (
                      <span className="inline-flex items-center rounded-full bg-[rgba(34,197,94,0.12)] px-2.5 py-1 text-xs font-semibold text-[#16a34a]">
                        Seen
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(107,114,128,0.12)] px-2.5 py-1 text-xs font-semibold text-gray-500">
                        Unseen
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : "—"}
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
                      title="Delete Notification"
                      description="Are you sure you want to delete this notification?"
                      onConfirm={async () => {
                        await deleteNotification(n.id);
                        startTransition(() => router.refresh());
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notifications.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No notifications found
          </div>
        )}
      </div>

      <PaginationControls total={total} limit={20} />

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Send Notification
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Title *</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Type</label>
                <input
                  type="text" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. job_alert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Number (optional)</label>
                <input
                  type="text" value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. job_id or resume_id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>User ID (optional, leave empty for broadcast)</label>
                <input
                  type="text" value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="UUID of specific user"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !form.title.trim()}
                onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--jobly-main)",
                  opacity: submitting || !form.title.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
