import { createClient } from '@/lib/supabase/server';
import { ResumeDetailPanel, type ResumeDetailPanelData } from '@/components/resume-detail-panel';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type ResumeRow = {
  id: string | number;
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
  view_count?: number | null;
  applied_count?: number | null;
  create_time?: string | null;
  expiration_date?: string | null;
  resume_number?: number | null;
  is_premium?: boolean | null;
  user_id?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const { id } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resumes')
    .select(
      'id, user_id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, marital_status, education_key, experience_key, skills, languages, about, experiences, educations, certifications, avatar, email, phone, view_count, applied_count, create_time, expiration_date, is_premium',
    )
    .eq('id', id)
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

  if (resume.resume_number != null) {
    redirect(`/cv/${resume.resume_number}`);
  }

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
    view_count: resume.view_count ?? 0,
    applied_count: resume.applied_count ?? 0,
    create_time: resume.create_time ?? null,
    expiration_date: resume.expiration_date ?? null,
    about: resume.about ?? null,
    user_id: resume.user_id ?? null,
    email: resume.email ?? null,
    phone: resume.phone ?? null,
    authUserId,
    authUserType,
  };

  return <ResumeDetailPanel resume={panelResume} />;
}
