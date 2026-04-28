"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPriceSettings, updatePriceSettings } from "../actions";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [form, setForm] = useState({
    price_job: "",
    price_premium_job: "",
    premium_day_job: "",
    normal_day_job: "",
    price_resume: "",
    price_premium_resume: "",
    premium_day_resume: "",
    normal_day_resume: "",
  });

  useEffect(() => {
    getPriceSettings().then((s) => {
      setSettings(s);
      if (s) {
        setForm({
          price_job: s.price_job != null ? String(s.price_job) : "",
          price_premium_job: s.price_premium_job != null ? String(s.price_premium_job) : "",
          premium_day_job: s.premium_day_job != null ? String(s.premium_day_job) : "",
          normal_day_job: s.normal_day_job != null ? String(s.normal_day_job) : "",
          price_resume: s.price_resume != null ? String(s.price_resume) : "",
          price_premium_resume: s.price_premium_resume != null ? String(s.price_premium_resume) : "",
          premium_day_resume: s.premium_day_resume != null ? String(s.premium_day_resume) : "",
          normal_day_resume: s.normal_day_resume != null ? String(s.normal_day_resume) : "",
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit() {
    if (!settings?.id) return;
    setSubmitting(true);
    try {
      const payload = {
        price_job: form.price_job ? Number(form.price_job) : undefined,
        price_premium_job: form.price_premium_job ? Number(form.price_premium_job) : undefined,
        premium_day_job: form.premium_day_job ? Number(form.premium_day_job) : undefined,
        normal_day_job: form.normal_day_job ? Number(form.normal_day_job) : undefined,
        price_resume: form.price_resume ? Number(form.price_resume) : undefined,
        price_premium_resume: form.price_premium_resume ? Number(form.price_premium_resume) : undefined,
        premium_day_resume: form.premium_day_resume ? Number(form.premium_day_resume) : undefined,
        normal_day_resume: form.normal_day_resume ? Number(form.normal_day_resume) : undefined,
      };
      await updatePriceSettings(settings.id, payload);
      const s = await getPriceSettings();
      setSettings(s);
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-96 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Settings
        </h1>
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No price settings found in database.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Manage pricing and platform configuration
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-5" style={{ color: "var(--foreground)" }}>
          Pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Job Post Price
            </label>
            <input
              type="number"
              value={form.price_job}
              onChange={(e) => setForm({ ...form, price_job: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Premium Job Price
            </label>
            <input
              type="number"
              value={form.price_premium_job}
              onChange={(e) => setForm({ ...form, price_premium_job: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Job Premium Days
            </label>
            <input
              type="number"
              value={form.premium_day_job}
              onChange={(e) => setForm({ ...form, premium_day_job: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Job Normal Days
            </label>
            <input
              type="number"
              value={form.normal_day_job}
              onChange={(e) => setForm({ ...form, normal_day_job: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Resume Price
            </label>
            <input
              type="number"
              value={form.price_resume}
              onChange={(e) => setForm({ ...form, price_resume: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Premium Resume Price
            </label>
            <input
              type="number"
              value={form.price_premium_resume}
              onChange={(e) => setForm({ ...form, price_premium_resume: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Resume Premium Days
            </label>
            <input
              type="number"
              value={form.premium_day_resume}
              onChange={(e) => setForm({ ...form, premium_day_resume: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Resume Normal Days
            </label>
            <input
              type="number"
              value={form.normal_day_resume}
              onChange={(e) => setForm({ ...form, normal_day_resume: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-11 px-8 rounded-xl text-sm font-semibold text-white"
            style={{
              backgroundColor: "var(--jobly-main)",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
