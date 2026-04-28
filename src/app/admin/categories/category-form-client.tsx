"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CategoryFormClient({
  mode,
  category,
  action,
}: {
  mode: "create" | "edit";
  category?: any;
  action: (payloadOrId: any, payload?: any) => Promise<{ success: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    display_name: category?.display_name ?? "",
    category_name: category?.category_name ?? "",
    list_id: category?.list_id ? String(category.list_id) : "",
    job_count: category?.job_count != null ? String(category.job_count) : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleSubmit() {
    if (!form.display_name.trim() || !form.category_name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        display_name: form.display_name.trim(),
        category_name: form.category_name.trim(),
        list_id: form.list_id ? Number(form.list_id) : undefined,
        job_count: form.job_count ? Number(form.job_count) : undefined,
      };
      if (mode === "edit" && category) {
        await (action as any)(category.id, payload);
      } else {
        await (action as any)(payload);
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {mode === "create" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 px-4 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ backgroundColor: "var(--jobly-main)" }}
        >
          + Add
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(36,91,235,0.12)] text-[#245beb]"
        >
          Edit
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {mode === "edit" ? "Edit Category" : "Add Category"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. Information Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  Category Key *
                </label>
                <input
                  type="text"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. category_it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  List ID
                </label>
                <input
                  type="number"
                  value={form.list_id}
                  onChange={(e) => setForm({ ...form, list_id: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="e.g. 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  Job Count
                </label>
                <input
                  type="number"
                  value={form.job_count}
                  onChange={(e) => setForm({ ...form, job_count: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !form.display_name.trim() || !form.category_name.trim()}
                onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--jobly-main)",
                  opacity: submitting || !form.display_name.trim() || !form.category_name.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
