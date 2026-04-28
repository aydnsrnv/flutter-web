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

const MARITALS = ["marital_single", "marital_married", "marital_divorced", "marital_widowed"];

function safeParseJson(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function ResumeFormClient({
  resume,
  action,
}: {
  resume: any;
  action: (id: string, payload: any) => Promise<{ success: boolean }>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: resume.full_name ?? "",
    desired_position: resume.desired_position ?? "",
    desired_salary: resume.desired_salary ?? "",
    city: resume.city ?? "",
    education_key: resume.education_key ?? "",
    experience_key: resume.experience_key ?? "",
    skills: resume.skills ?? "",
    languages: resume.languages ?? "",
    about: resume.about ?? "",
    gender_key: resume.gender_key ?? "",
    marital_status: resume.marital_status ?? "",
    email: resume.email ?? "",
    phone: resume.phone ?? "",
    birth_year: resume.birth_year != null ? String(resume.birth_year) : "",
    experiences: safeParseJson(resume.experiences),
    educations: safeParseJson(resume.educations),
    certifications: safeParseJson(resume.certifications),
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Experience helpers
  function addExperience() {
    setForm({
      ...form,
      experiences: [
        ...form.experiences,
        { company: "", position: "", start_year: "", start_month: "", end_year: "", end_month: "", description: "" },
      ],
    });
  }
  function updateExperience(idx: number, field: string, val: string) {
    const next = [...form.experiences];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, experiences: next });
  }
  function removeExperience(idx: number) {
    setForm({ ...form, experiences: form.experiences.filter((_: any, i: number) => i !== idx) });
  }

  // Education helpers
  function addEducation() {
    setForm({
      ...form,
      educations: [
        ...form.educations,
        { institution: "", degree: "", field: "", start_year: "", end_year: "", description: "" },
      ],
    });
  }
  function updateEducation(idx: number, field: string, val: string) {
    const next = [...form.educations];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, educations: next });
  }
  function removeEducation(idx: number) {
    setForm({ ...form, educations: form.educations.filter((_: any, i: number) => i !== idx) });
  }

  // Certification helpers
  function addCertification() {
    setForm({
      ...form,
      certifications: [
        ...form.certifications,
        { name: "", issuer: "", year: "", description: "" },
      ],
    });
  }
  function updateCertification(idx: number, field: string, val: string) {
    const next = [...form.certifications];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, certifications: next });
  }
  function removeCertification(idx: number) {
    setForm({ ...form, certifications: form.certifications.filter((_: any, i: number) => i !== idx) });
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = {
        full_name: form.full_name.trim(),
        desired_position: form.desired_position.trim() || undefined,
        desired_salary: form.desired_salary.trim() || undefined,
        city: form.city || undefined,
        education_key: form.education_key || undefined,
        experience_key: form.experience_key || undefined,
        skills: form.skills.trim() || undefined,
        languages: form.languages.trim() || undefined,
        about: form.about.trim() || undefined,
        gender_key: form.gender_key || undefined,
        marital_status: form.marital_status || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        birth_year: form.birth_year ? Number(form.birth_year) : undefined,
        experiences: form.experiences.length > 0 ? form.experiences : undefined,
        educations: form.educations.length > 0 ? form.educations : undefined,
        certifications: form.certifications.length > 0 ? form.certifications : undefined,
      };
      await action(resume.id, payload);
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
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Edit Resume</h3>
            <div className="mt-4 space-y-6">

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Full Name *</label>
                  <input type="text" value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Desired Position</label>
                  <input type="text" value={form.desired_position}
                    onChange={(e) => setForm({ ...form, desired_position: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Desired Salary</label>
                  <input type="text" value={form.desired_salary}
                    onChange={(e) => setForm({ ...form, desired_salary: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Birth Year</label>
                  <input type="number" value={form.birth_year}
                    onChange={(e) => setForm({ ...form, birth_year: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} placeholder="e.g. 1990" />
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Gender</label>
                  <select
                    value={form.gender_key}
                    onChange={(e) => setForm({ ...form, gender_key: e.target.value })}
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Marital Status</label>
                  <select
                    value={form.marital_status}
                    onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }}
                  >
                    <option value="">Select status...</option>
                    {MARITALS.map((k) => (
                      <option key={k} value={k}>{t(k)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Education</label>
                  <select
                    value={form.education_key}
                    onChange={(e) => setForm({ ...form, education_key: e.target.value })}
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
                    value={form.experience_key}
                    onChange={(e) => setForm({ ...form, experience_key: e.target.value })}
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Email</label>
                  <input type="text" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Phone</label>
                  <input type="text" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Skills</label>
                  <input type="text" value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} placeholder="Comma separated" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Languages</label>
                  <input type="text" value={form.languages}
                    onChange={(e) => setForm({ ...form, languages: e.target.value })}
                    className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[var(--jobly-main)]"
                    style={{ color: "var(--foreground)" }} placeholder="Comma separated" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>About</label>
                  <textarea value={form.about} rows={4}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                    style={{ color: "var(--foreground)" }} />
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Work Experience</h4>
                  <button type="button" onClick={addExperience}
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--jobly-main)" }}>+ Add</button>
                </div>
                <div className="space-y-3">
                  {form.experiences.map((exp: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-border bg-background p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Company" value={exp.company ?? ""}
                          onChange={(e) => updateExperience(idx, "company", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="text" placeholder="Position" value={exp.position ?? ""}
                          onChange={(e) => updateExperience(idx, "position", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="Start Year" value={exp.start_year ?? ""}
                          onChange={(e) => updateExperience(idx, "start_year", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="Start Month" value={exp.start_month ?? ""}
                          onChange={(e) => updateExperience(idx, "start_month", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="End Year (empty = current)" value={exp.end_year ?? ""}
                          onChange={(e) => updateExperience(idx, "end_year", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="End Month" value={exp.end_month ?? ""}
                          onChange={(e) => updateExperience(idx, "end_month", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                      </div>
                      <textarea placeholder="Description" value={exp.description ?? ""} rows={2}
                        onChange={(e) => updateExperience(idx, "description", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                        style={{ color: "var(--foreground)" }} />
                      <button type="button" onClick={() => removeExperience(idx)}
                        className="text-xs font-semibold text-[#dc2626]">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Education</h4>
                  <button type="button" onClick={addEducation}
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--jobly-main)" }}>+ Add</button>
                </div>
                <div className="space-y-3">
                  {form.educations.map((edu: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-border bg-background p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Institution" value={edu.institution ?? ""}
                          onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="text" placeholder="Degree" value={edu.degree ?? ""}
                          onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="text" placeholder="Field" value={edu.field ?? ""}
                          onChange={(e) => updateEducation(idx, "field", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="Start Year" value={edu.start_year ?? ""}
                          onChange={(e) => updateEducation(idx, "start_year", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="End Year" value={edu.end_year ?? ""}
                          onChange={(e) => updateEducation(idx, "end_year", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                      </div>
                      <textarea placeholder="Description" value={edu.description ?? ""} rows={2}
                        onChange={(e) => updateEducation(idx, "description", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                        style={{ color: "var(--foreground)" }} />
                      <button type="button" onClick={() => removeEducation(idx)}
                        className="text-xs font-semibold text-[#dc2626]">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Certifications</h4>
                  <button type="button" onClick={addCertification}
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: "var(--jobly-main)" }}>+ Add</button>
                </div>
                <div className="space-y-3">
                  {form.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-border bg-background p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Name" value={cert.name ?? ""}
                          onChange={(e) => updateCertification(idx, "name", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="text" placeholder="Issuer" value={cert.issuer ?? ""}
                          onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                        <input type="number" placeholder="Year" value={cert.year ?? ""}
                          onChange={(e) => updateCertification(idx, "year", e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                          style={{ color: "var(--foreground)" }} />
                      </div>
                      <textarea placeholder="Description" value={cert.description ?? ""} rows={2}
                        onChange={(e) => updateCertification(idx, "description", e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-[var(--jobly-main)] resize-none"
                        style={{ color: "var(--foreground)" }} />
                      <button type="button" onClick={() => removeCertification(idx)}
                        className="text-xs font-semibold text-[#dc2626]">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}>Cancel</button>
              <button type="button" disabled={submitting || !form.full_name.trim()} onClick={handleSubmit}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--jobly-main)", opacity: submitting || !form.full_name.trim() ? 0.5 : 1 }}>
                {submitting ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
