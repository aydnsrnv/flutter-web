"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CompanyFormClient({
  mode,
  company,
  action,
}: {
  mode: "create" | "edit";
  company?: any;
  action: (payloadOrId: any, payload?: any) => Promise<{ success: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company_name: company?.company_name ?? "",
    company_logo: company?.company_logo ?? "",
    about: company?.about ?? "",
    job_count: company?.job_count != null ? String(company.job_count) : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleSubmit() {
    if (!form.company_name.trim()) return;
    setSubmitting(true);
    try {
      if (mode === "edit" && company) {
        await (action as any)(company.id, form);
      } else {
        await (action as any)(form);
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
              {mode === "edit" ? "Edit Company" : "Add Company"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  Logo URL
                </label>
                <input
                  type="text"
                  value={form.company_logo}
                  onChange={(e) => setForm({ ...form, company_logo: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                  placeholder="https://..."
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
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                  About
                </label>
                <textarea
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                  style={{ color: "var(--foreground)" }}
                  placeholder="Short description..."
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
                disabled={submitting || !form.company_name.trim()}
                onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--jobly-main)",
                  opacity: submitting || !form.company_name.trim() ? 0.5 : 1,
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
