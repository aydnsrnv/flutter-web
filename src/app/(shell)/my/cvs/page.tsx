import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

import { MyResumesClient } from "@/app/(shell)/my/cvs/my-resumes-client";

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
  user_id?: string | null;
};

export default async function MyResumesPage({
  searchParams,
}: {
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const sp = await Promise.resolve(searchParams);
  const tab = (sp?.tab ?? "active").toString();
  const isActive = tab !== "inactive";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  if (!uid) redirect("/login");

  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status, user_id",
    )
    .eq("user_id", uid)
    .eq("status", isActive)
    .order("create_time", { ascending: false })
    .limit(20);

  const rows = (data ?? []) as ResumeRow[];

  const limit = 20;

  return (
    <div className="flex flex-col">
      <div className="mt-[18px] mb-1">
        <div className="flex gap-0 rounded-full border border-border bg-card p-1">
          <Link
            href="/my/cvs?tab=active"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${isActive ? "bg-primary/12 font-bold text-primary" : "font-semibold text-foreground"}`}
          >
            {t("my_resumes_tab_active")}
          </Link>
          <Link
            href="/my/cvs?tab=inactive"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${!isActive ? "bg-primary/12 font-bold text-primary" : "font-semibold text-foreground"}`}
          >
            {t("my_resumes_tab_inactive")}
          </Link>
        </div>
      </div>

      <div className="mt-[6px]">
        {error ? (
          <div className="rounded-lg bg-background px-4 py-6 text-center text-[16px] text-foreground">
            {error.message}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState label={t("resumes_empty")} />
        ) : (
          <MyResumesClient
            initialResumes={rows}
            initialHasMore={rows.length >= limit}
            limit={limit}
            isActive={isActive}
          />
        )}
      </div>
    </div>
  );
}
