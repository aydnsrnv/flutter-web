"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { SearchableSelect } from "../components/searchable-select";

const CITIES = [
  "city_baku","city_absheron","city_agdam","city_agdash","city_aghdara","city_aghstafa",
  "city_agjabadi","city_agsu","city_ali_bayramli","city_astara","city_balakan","city_barda",
  "city_beylagan","city_culfa","city_dashkasan","city_fuzuli","city_gadabay","city_ganja",
  "city_garadag","city_gobustan","city_goychay","city_goygol","city_goytepe","city_hajigabul",
  "city_imishli","city_ismayilli","city_jalilabad","city_kalbajar","city_khankendi",
  "city_khirdalan","city_khizi","city_khojali","city_khojavend","city_khudat","city_kurdamir",
  "city_lachin","city_lenkeran","city_lerik","city_masalli","city_mingechevir","city_naftalan",
  "city_nakhchivan","city_neftchala","city_oguz","city_ordubad","city_qabala","city_qakh",
  "city_qazakh","city_quba","city_qubadli","city_qusar","city_saatli","city_sabirabad",
  "city_salyan","city_samukh","city_shabran","city_shahbuz","city_shamakhi","city_shamkir",
  "city_sharur","city_sheki","city_shirvan","city_shusha","city_siazan","city_sumgait",
  "city_tartar","city_tovuz","city_ujar","city_yardimli","city_yevlakh","city_zangilan",
  "city_zaqatala","city_zardab",
];

const JOB_TYPES = ["job_type_full_time", "job_type_part_time", "job_type_intern"];

const EDUCATIONS = [
  "education_higher",
  "education_incomplete_higher",
  "education_secondary_special",
];

const EXPERIENCES = [
  "exp_less_than_one",
  "exp_one_to_three",
  "exp_three_to_five",
  "exp_more_than_five",
  "exp_none",
];

const GENDERS = ["male", "female", "all_genders"];

export function JobFormClient({
  job,
  companies,
  action,
}: {
  job: any;
  companies: { id: string; company_name: string; company_logo?: string | null }[];
  action: (id: string, payload: any) => Promise<{ success: boolean }>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: job.title ?? "",
    company_id: job.company_id ?? "",
    company_name: job.company_name ?? "",
    city: job.city ?? "",
    job_type: job.job_type ?? "",
    min_salary: job.min_salary ?? "",
    max_salary: job.max_salary ?? "",
    education: job.education ?? "",
    experience: job.experience ?? "",
    gender: job.gender ?? "",
    mail: job.mail ?? "",
    number: job.number ?? "",
    request: job.request ?? "",
    about: job.about ?? "",
    apply_link: job.apply_link ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleCompanyChange(val: string) {
    const selected = companies.find((c) => c.id === val);
    setForm({
      ...form,
      company_id: val,
      company_name: selected?.company_name ?? form.company_name,
    });
  }

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        city: form.city || undefined,
        job_type: form.job_type || undefined,
        min_salary: form.min_salary.trim() || undefined,
        max_salary: form.max_salary.trim() || undefined,
        education: form.education || undefined,
        experience: form.experience || undefined,
        gender: form.gender || undefined,
        mail: form.mail.trim() || undefined,
        number: form.number.trim() || undefined,
        request: form.request.trim() || undefined,
        about: form.about.trim() || undefined,
        apply_link: form.apply_link.trim() || undefined,
      };
      if (form.company_id) {
        payload.company_id = form.company_id;
        payload.company_name = form.company_name;
      }
      await action(job.id, payload);
      setOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[rgba(36,91,235,0.12)] text-[#245beb]"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Edit Job</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Title *</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Company</label>
                <SearchableSelect
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.company_name,
                    logo: c.company_logo,
                  }))}
                  value={form.company_id}
                  onChange={handleCompanyChange}
                  placeholder="Search company..."
                  searchKeys={["label"]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>City</label>
                <SearchableSelect
                  options={CITIES.map((k) => ({ value: k, label: t(k) }))}
                  value={form.city}
                  onChange={(val) => setForm({ ...form, city: val })}
                  placeholder="Search city..."
                  searchKeys={["label"]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Job Type</label>
                <select
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <option value="">Select type...</option>
                  {JOB_TYPES.map((k) => (
                    <option key={k} value={k}>{t(k)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Min Salary</label>
                <input type="text" value={form.min_salary}
                  onChange={(e) => setForm({ ...form, min_salary: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Max Salary</label>
                <input type="text" value={form.max_salary}
                  onChange={(e) => setForm({ ...form, max_salary: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Education</label>
                <select
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <option value="">Select education...</option>
                  {EDUCATIONS.map((k) => (
                    <option key={k} value={k}>{t(k)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Experience</label>
                <select
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <option value="">Select experience...</option>
                  {EXPERIENCES.map((k) => (
                    <option key={k} value={k}>{t(k)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <option value="">Select gender...</option>
                  {GENDERS.map((k) => (
                    <option key={k} value={k}>{t(k)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Email</label>
                <input type="text" value={form.mail}
                  onChange={(e) => setForm({ ...form, mail: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Phone</label>
                <input type="text" value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Apply Link</label>
                <input type="text" value={form.apply_link}
                  onChange={(e) => setForm({ ...form, apply_link: e.target.value })}
                  className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                  style={{ color: "var(--foreground)" }} placeholder="https://..." />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Request</label>
                <textarea value={form.request} rows={3}
                  onChange={(e) => setForm({ ...form, request: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                  style={{ color: "var(--foreground)" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>About</label>
                <textarea value={form.about} rows={3}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                  style={{ color: "var(--foreground)" }} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}>Cancel</button>
              <button type="button" disabled={submitting || !form.title.trim()} onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--jobly-main)", opacity: submitting || !form.title.trim() ? 0.5 : 1 }}>
                {submitting ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
