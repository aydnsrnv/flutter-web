import {
  ResumeDetailPanel,
  type ResumeDetailPanelData,
} from "@/components/resume-detail-panel";
import { ResumeListGroup } from "@/components/resume-list-group";
import type { ResumeListItemData } from "@/components/resume-list-item";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { incrementResumeViewCount } from "@/app/actions/stats";
import type { Metadata } from "next";

const siteName = "Jobly";
const siteUrl = "https://jobly.az";
const siteHost = "jobly.az";
const siteLogo = `${siteUrl}/jobly_icon.jpg`;

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type PageParams = { resume_number: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}): Promise<Metadata> {
  const { resume_number } = await Promise.resolve(params);
  const supabase = await createClient();

  const parsed = Number(resume_number);
  const resumeNumber = Number.isFinite(parsed) ? parsed : resume_number;

  const { data } = await supabase
    .from("resumes")
    .select("full_name, desired_position, city")
    .eq("resume_number", resumeNumber)
    .maybeSingle();

  const fullName = (data as any)?.full_name
    ? String((data as any).full_name)
    : "CV";
  const position = (data as any)?.desired_position
    ? String((data as any).desired_position)
    : "CV";
  const city = (data as any)?.city ? String((data as any).city) : "";

  const base = new URL(siteUrl);
  const canonical = `/cv/${encodeURIComponent(String(resume_number))}`;
  const absoluteUrl = new URL(canonical, base);
  const desc = city
    ? `${fullName} — ${position}. Şəhər: ${city}. Jobly-da CV-lərə bax və namizədlər tap.`
    : `${fullName} — ${position}. Jobly-da CV-lərə bax və namizədlər tap.`;
  const ogTitle = `${fullName} — ${position}`;
  const ogDescription = desc;
  const ogImages = [
    {
      url: new URL(
        `/cv/${encodeURIComponent(String(resume_number))}/opengraph-image`,
        base,
      ),
      width: 1200,
      height: 630,
      alt: `${ogTitle} | ${siteHost}`,
    },
  ];

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      siteName,
      title: ogTitle,
      description: ogDescription,
      url: absoluteUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImages.map((image) => image.url),
    },
  };
}

type ResumeRow = {
  id: string | number;
  resume_number?: number | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  gender_key?: string | null;
  marital_status?: string | null;
  education_key?: string | null;
  experience_key?: string | null;
  skills?: string | null;
  languages?: string | null;
  about?: string | null;
  experiences?: unknown;
  educations?: unknown;
  certifications?: unknown;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
  create_time?: string | null;
  expiration_date?: string | null;
  is_premium?: boolean | null;
  user_id?: string | null;
};

type SimilarResumeRow = {
  id: string | number;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  gender_key?: string | null;
  experience_key?: string | null;
  education_key?: string | null;
  experiences?: unknown;
  avatar?: string | null;
  view_count?: number | null;
  create_time?: string | null;
  is_premium?: boolean | null;
};

export default async function ResumeByNumberPage({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const { resume_number } = await Promise.resolve(params);
  const supabase = await createClient();

  const parsed = Number(resume_number);
  const resumeNumber = Number.isFinite(parsed) ? parsed : resume_number;

  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, user_id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, marital_status, education_key, experience_key, skills, languages, about, experiences, educations, certifications, avatar, email, phone, view_count, applied_count, create_time, expiration_date, is_premium",
    )
    .eq("resume_number", resumeNumber)
    .maybeSingle();

  const resume = data as ResumeRow | null;

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">{error.message}</div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">
          {t("resume_detail_not_found")}
        </div>
      </div>
    );
  }

  incrementResumeViewCount(String(resume.id));
  resume.view_count = (resume.view_count || 0) + 1;

  const { data: authData } = await supabase.auth.getUser();
  const authUserId = authData?.user?.id ?? null;
  let authUserType = "candidate";
  if (authUserId) {
    const { data: userData } = await supabase
      .from("users")
      .select("user_type")
      .eq("user_id", authUserId)
      .maybeSingle();
    if (userData?.user_type) {
      authUserType = String(userData.user_type).toLowerCase();
    }
  }

  const desiredPosition = resume.desired_position ?? "";
  const similarQuery = desiredPosition.trim().length > 0
    ? supabase
        .from("resumes")
        .select(
          "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium",
        )
        .eq("status", true)
        .ilike("desired_position", `%${desiredPosition}%`)
        .neq("id", resume.id)
        .order("create_time", { ascending: false })
        .limit(5)
    : supabase
        .from("resumes")
        .select(
          "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium",
        )
        .eq("status", true)
        .neq("id", resume.id)
        .order("create_time", { ascending: false })
        .limit(5);

  const { data: similarData } = await similarQuery;
  const similarResumes = (similarData ?? []) as SimilarResumeRow[];

  const panelResume: ResumeDetailPanelData = {
    id: String(resume.id),
    resume_number: resume.resume_number ?? null,
    full_name: resume.full_name,
    desired_position: resume.desired_position ?? null,
    desired_salary: resume.desired_salary ?? null,
    city: resume.city ?? null,
    birth_year: resume.birth_year ?? null,
    gender_key: resume.gender_key ?? null,
    marital_status: resume.marital_status ?? null,
    experience_key: resume.experience_key ?? null,
    education_key: resume.education_key ?? null,
    skills: resume.skills ?? null,
    languages: resume.languages ?? null,
    experiences: resume.experiences ?? null,
    educations: resume.educations ?? null,
    certifications: resume.certifications ?? null,
    avatar: resume.avatar ?? null,
    email: resume.email ?? null,
    phone: resume.phone ?? null,
    view_count: resume.view_count ?? 0,
    applied_count: resume.applied_count ?? 0,
    create_time: resume.create_time ?? null,
    expiration_date: resume.expiration_date ?? null,
    about: resume.about ?? null,
    user_id: resume.user_id ?? null,
    authUserId,
    authUserType,
  };

  const base = "https://jobly.az";
  const resumeUrl = `${base}/cv/${encodeURIComponent(String(resume_number))}`;
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.full_name,
    url: resumeUrl,
    image: resume.avatar ?? undefined,
    address: resume.city
      ? {
          "@type": "PostalAddress",
          addressLocality: resume.city,
          addressCountry: "AZ",
        }
      : undefined,
    jobTitle: resume.desired_position ?? undefined,
    description: resume.about ?? undefined,
  };

  const toItem = (r: SimilarResumeRow): ResumeListItemData => ({
    id: String(r.id),
    resume_number: r.resume_number,
    full_name: r.full_name,
    desired_position: r.desired_position ?? null,
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
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1">
          <ResumeDetailPanel resume={panelResume} />
        </div>
        <div className="hidden lg:block lg:w-[320px] lg:shrink-0">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 text-base font-semibold text-foreground">
                {t("similar_jobs")}
              </div>
              {similarResumes.length > 0 ? (
                <ResumeListGroup
                  resumes={similarResumes.map((r) => toItem(r))}
                  mobileLimit={5}
                  desktopLimit={5}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
