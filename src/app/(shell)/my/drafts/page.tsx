import Link from "next/link";
import { redirect } from "next/navigation";

import { DraftItem } from "@/components/draft-item";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type DraftRow = {
  id: string | number;
  title?: string | null;
  city?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  min_salary?: string | null;
  max_salary?: string | null;
  create_time?: string | null;
};

export default async function MyDraftsPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  if (!uid) redirect("/login");

  // Get user type to determine which drafts to show
  const { data: userData } = await supabase
    .from("users")
    .select("user_type")
    .eq("user_id", uid)
    .single();

  const userType = (userData?.user_type ?? "candidate").toLowerCase();
  const isCandidate = userType === "candidate";
  const draftType = isCandidate ? "resume" : "job";
  const tableName = isCandidate ? "resume_drafts" : "job_drafts";

  const draftSelect = isCandidate
    ? "id, title, city, create_time"
    : "id, title, city, company_name, company_logo, min_salary, max_salary, create_time";

  const { data, error } = await supabase
    .from(tableName)
    .select(draftSelect)
    .eq("creator_id", uid)
    .order("create_time", { ascending: false })
    .limit(50);

  const drafts = (data ?? []) as DraftRow[];

  return (
    <div className="flex flex-col">
      <div className="mt-4">
        {error ? (
          <div className="rounded-lg bg-background px-4 py-6 text-center text-[16px] text-foreground">
            {error.message}
          </div>
        ) : drafts.length === 0 ? (
          <EmptyState label={t("noDraftsFound")} />
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <DraftItem
                key={String(draft.id)}
                draft={draft}
                draftType={draftType}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[12px] text-muted-foreground">
          {t("draftsInfoFooter")}
        </p>
      </div>
    </div>
  );
}
