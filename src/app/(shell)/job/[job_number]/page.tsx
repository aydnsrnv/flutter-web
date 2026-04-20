import { JobDetailPanel, type JobDetailPanelData } from '@/components/job-detail-panel';
import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
import { incrementJobViewCount } from '@/app/actions/stats';
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

type PageParams = { job_number: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}): Promise<Metadata> {
  const { job_number } = await Promise.resolve(params);
  const supabase = await createClient();

  const parsed = Number(job_number);
  const jobNumber = Number.isFinite(parsed) ? parsed : job_number;

  const { data } = await supabase
    .from('jobs')
    .select('title, company_name, city')
    .eq('job_number', jobNumber)
    .maybeSingle();

  const title = (data as any)?.title ? String((data as any).title) : 'Vakansiya';
  const company = (data as any)?.company_name ? String((data as any).company_name) : 'Jobly';
  const city = (data as any)?.city ? String((data as any).city) : '';

  const base = new URL('https://jobly.az');
  const canonical = `/job/${encodeURIComponent(String(job_number))}`;
  const desc = city
    ? `${title} vakansiyası — ${company}. Şəhər: ${city}. Jobly-da vakansiyalara bax, iş tap və iş axtar.`
    : `${title} vakansiyası — ${company}. Jobly-da vakansiyalara bax, iş tap və iş axtar.`;

  return {
    title: `${title} — ${company}`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${title} — ${company}`,
      description: desc,
      url: new URL(canonical, base),
    },
  };
}

type JobRow = {
  id: string | number;
  job_number?: string | number | null;
  title: string;
  job_type?: string | null;
  category_name?: string | null;
  company_id?: string | number | null;
  company_name: string;
  company_logo?: string | null;
  city?: string | null;
  create_time?: string | null;
  expiration_date?: string | null;
  min_age?: string | number | null;
  max_age?: string | number | null;
  education?: string | null;
  experience?: string | null;
  gender?: string | null;
  min_salary?: string | null;
  max_salary?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
  request?: string | null;
  about?: string | null;
  number?: string | null;
  mail?: string | null;
  apply_link?: string | null;
};

type SimilarJobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  create_time?: string | null;
  min_salary?: string | null;
  max_salary?: string | null;
};

export default async function JobByNumberPage({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const { job_number } = await Promise.resolve(params);
  const supabase = await createClient();

  const parsed = Number(job_number);
  const jobNumber = Number.isFinite(parsed) ? parsed : job_number;

  const { data, error } = await supabase
    .from('jobs')
    .select(
      'id, job_number, title, job_type, category_name, company_id, company_name, company_logo, city, create_time, expiration_date, min_age, max_age, education, experience, gender, min_salary, max_salary, view_count, applied_count, request, about, number, mail, apply_link',
    )
    .eq('job_number', jobNumber)
    .maybeSingle();

  const job = data as JobRow | null;

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">{error.message}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">{t('job_not_found')}</div>
      </div>
    );
  }

  // Increment view count directly without awaiting
  incrementJobViewCount(String(job.id));
  job.view_count = (job.view_count || 0) + 1;

  const { data: similarData } = await supabase
    .from('jobs')
    .select(
      'id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary',
    )
    .eq('status', true)
    .eq('category_name', job.category_name ?? '')
    .neq('id', job.id)
    .order('create_time', { ascending: false })
    .limit(5);

  const similarJobs = (similarData ?? []) as SimilarJobRow[];

  const panelJob: JobDetailPanelData = {
    id: String(job.id),
    job_number: job.job_number,
    title: job.title,
    job_type: job.job_type ?? null,
    category_name: job.category_name ?? null,
    company_id: job.company_id,
    company_name: job.company_name,
    company_logo: job.company_logo ?? '',
    city: job.city ?? null,
    create_time: job.create_time ?? null,
    expiration_date: job.expiration_date ?? null,
    min_age: job.min_age ?? null,
    max_age: job.max_age ?? null,
    education: job.education ?? null,
    experience: job.experience ?? null,
    gender: job.gender ?? null,
    view_count: job.view_count ?? 0,
    applied_count: job.applied_count ?? 0,
    min_salary: job.min_salary ?? null,
    max_salary: job.max_salary ?? null,
    request: job.request ?? null,
    about: job.about ?? null,
    number: job.number ?? null,
    mail: job.mail ?? null,
    apply_link: job.apply_link ?? null,
    similar_jobs: similarJobs.map((j) => ({
      id: String(j.id),
      job_number: j.job_number ?? null,
      title: j.title,
      company_name: j.company_name,
      company_logo: j.company_logo,
      city: j.city,
      create_time: j.create_time ?? undefined,
      min_salary: j.min_salary ?? null,
      max_salary: j.max_salary ?? null,
    })),
  };

  const base = 'https://jobly.az';
  const jobUrl = `${base}/job/${encodeURIComponent(String(job_number))}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    datePosted: job.create_time ?? undefined,
    validThrough: job.expiration_date ?? undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      sameAs: job.company_id ? `${base}/company/${encodeURIComponent(String(job.company_id))}` : undefined,
      logo: job.company_logo ?? undefined,
    },
    jobLocation: job.city
      ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.city,
            addressCountry: 'AZ',
          },
        }
      : undefined,
    url: jobUrl,
    description: [job.about, job.request].filter(Boolean).join('\n\n') || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <JobDetailPanel job={panelJob} />
    </>
  );
}
