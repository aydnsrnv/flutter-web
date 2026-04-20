import { ResumeDetailPanel, type ResumeDetailPanelData } from '@/components/resume-detail-panel';
import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
import { incrementResumeViewCount } from '@/app/actions/stats';
import type { Metadata } from 'next';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
    .from('resumes')
    .select('full_name, desired_position, city')
    .eq('resume_number', resumeNumber)
    .maybeSingle();

  const fullName = (data as any)?.full_name ? String((data as any).full_name) : 'CV';
  const position = (data as any)?.desired_position ? String((data as any).desired_position) : 'CV';
  const city = (data as any)?.city ? String((data as any).city) : '';

  const base = new URL('https://jobly.az');
  const canonical = `/resume/${encodeURIComponent(String(resume_number))}`;
  const desc = city
    ? `${fullName} — ${position}. Şəhər: ${city}. Jobly-da CV-lərə bax və namizədlər tap.`
    : `${fullName} — ${position}. Jobly-da CV-lərə bax və namizədlər tap.`;

  return {
    title: `${fullName} — ${position}`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${fullName} — ${position}`,
      description: desc,
      url: new URL(canonical, base),
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
    .from('resumes')
    .select(
      'id, user_id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, marital_status, education_key, experience_key, skills, languages, about, experiences, educations, certifications, avatar, email, phone, view_count, applied_count, create_time, expiration_date, is_premium',
    )
    .eq('resume_number', resumeNumber)
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
        <div className="text-sm text-muted-foreground">{t('resume_detail_not_found')}</div>
      </div>
    );
  }

  incrementResumeViewCount(String(resume.id));
  resume.view_count = (resume.view_count || 0) + 1;

  const { data: authData } = await supabase.auth.getUser();
  const authUserId = authData?.user?.id ?? null;
  let authUserType = 'candidate';
  if (authUserId) {
    const { data: userData } = await supabase.from('users').select('user_type').eq('user_id', authUserId).maybeSingle();
    if (userData?.user_type) {
      authUserType = String(userData.user_type).toLowerCase();
    }
  }

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

  const base = 'https://jobly.az';
  const resumeUrl = `${base}/resume/${encodeURIComponent(String(resume_number))}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resume.full_name,
    url: resumeUrl,
    image: resume.avatar ?? undefined,
    address: resume.city
      ? {
          '@type': 'PostalAddress',
          addressLocality: resume.city,
          addressCountry: 'AZ',
        }
      : undefined,
    jobTitle: resume.desired_position ?? undefined,
    description: resume.about ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <ResumeDetailPanel resume={panelResume} />
    </>
  );
}
