import type { ResumeListItemData } from "@/components/resume-list-item";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

import { LatestResumesClient } from "@/app/(shell)/latest-resumes/latest-resumes-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type ResumeRow = {
  id: string | number;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  experience_key?: string | null;
  education_key?: string | null;
  experiences?: unknown;
  avatar?: string | null;
  view_count?: number | null;
  create_time?: string | null;
  is_premium?: boolean | null;
  status?: boolean | null;
};

export default async function LatestResumesPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();
  const limit = 20;

  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status",
    )
    .eq("status", true)
    .order("create_time", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as ResumeRow[];

  const toItem = (r: ResumeRow): ResumeListItemData => ({
    id: String(r.id),
    resume_number: r.resume_number,
    full_name: r.full_name,
    desired_position: r.desired_position,
    desired_salary: r.desired_salary ?? null,
    city: r.city,
    birth_year: r.birth_year ?? null,
    experience_key: r.experience_key ?? null,
    education_key: r.education_key ?? null,
    experiences: r.experiences ?? null,
    avatar: r.avatar,
    view_count: r.view_count,
    create_time: r.create_time,
    is_premium: r.is_premium,
  });

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {error.message}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState label={t("no_data")} />
      ) : (
        <LatestResumesClient
          initialItems={rows.map(toItem)}
          initialHasMore={rows.length >= limit}
          limit={limit}
        />
      )}
    </div>
  );
}
