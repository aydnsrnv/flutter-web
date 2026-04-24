import { createClient } from '@/lib/supabase/server';
import { JobDetailPanel, type JobDetailPanelData } from '@/components/job-detail-panel';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data } = await supabase
    .from('jobs')
    .select('title, company_name, city')
    .eq('id', id)
    .maybeSingle();

  const title = (data as any)?.title
    ? String((data as any).title)
    : 'Vakansiya';
  const company = (data as any)?.company_name
    ? String((data as any).company_name)
    : 'Jobly';
  const city = (data as any)?.city ? String((data as any).city) : '';

  const base = new URL('https://jobly.az');
  const canonical = `/jobs/${encodeURIComponent(String(id))}`;
  const desc = city
    ? `${title} vakansiyası — ${company}. Şəhər: ${city}. Jobly-da vakansiyalara bax, iş tap və iş axtar.`
    : `${title} vakansiyası — ${company}. Jobly-da vakansiyalara bax, iş tap və iş axtar.`;

  return {
    title: `${title} — ${company}`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: 'Jobly',
      title: `${title} — ${company}`,
      description: desc,
      url: new URL(canonical, base),
      images: [
        {
          url: new URL(`/jobs/${encodeURIComponent(String(id))}/opengraph-image`, base),
          width: 1200,
          height: 630,
          alt: `${title} — ${company}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${company}`,
      description: desc,
      images: [new URL(`/jobs/${encodeURIComponent(String(id))}/opengraph-image`, base)],
    },
  };
}

type JobRow = {
  id: string | number;
  job_number?: string | number | null;
  title: string;
  company_name: string;
  company_logo?: string | null;
  company_id?: string | number | null;
  city?: string | null;
  create_time?: string | null;
  min_salary?: string | null;
  max_salary?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
  request?: string | null;
  about?: string | null;
};

export default async function JobDetailPage({
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
    .from('jobs')
    .select(
      'id, job_number, title, company_id, company_name, company_logo, city, create_time, min_salary, max_salary, view_count, applied_count, request, about',
    )
    .eq('id', id)
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

  if (job.job_number != null) {
    redirect(`/job/${job.job_number}`);
  }

  const panelJob: JobDetailPanelData = {
    id: String(job.id),
    job_number: job.job_number,
    title: job.title,
    company_id: job.company_id,
    company_name: job.company_name,
    company_logo: job.company_logo ?? '',
    city: job.city ?? null,
    create_time: job.create_time ?? null,
    view_count: job.view_count ?? 0,
    applied_count: job.applied_count ?? 0,
    min_salary: job.min_salary ?? null,
    max_salary: job.max_salary ?? null,
    request: job.request ?? null,
    about: job.about ?? null,
  };

  return <JobDetailPanel job={panelJob} />;
}
