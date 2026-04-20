import { SectionHeader } from '@/components/section-header';
import { createClient } from '@/lib/supabase/server';
import type { FlutterJobItemData } from '@/components/flutter-job-item';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

import { LatestJobsClient } from '@/app/(shell)/latest/latest-client';

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  city: string;
  view_count: number;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
  company_logo?: string | null;
};

export default async function LatestPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();
  const limit = 20;
  const { data, error } = await supabase
    .from('jobs')
    .select(
      'id, job_number, title, company_name, company_logo, city, view_count, create_time, min_salary, max_salary',
    )
    .eq('status', true)
    .order('create_time', { ascending: false })
    .limit(limit);

  const jobs = (data ?? []) as JobRow[];

  const toFlutterJobItem = (j: JobRow): FlutterJobItemData => ({
    id: String(j.id),
    job_number: j.job_number,
    title: j.title,
    company_name: j.company_name,
    company_logo: j.company_logo ?? '',
    city: j.city,
    create_time: j.create_time,
    min_salary: j.min_salary,
    max_salary: j.max_salary,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl">
        {error ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            {error.message}
          </div>
        ) : jobs.length === 0 ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            {t('no_data')}
          </div>
        ) : (
          <LatestJobsClient
            initialJobs={jobs.map(toFlutterJobItem)}
            initialHasMore={jobs.length >= limit}
            limit={limit}
          />
        )}
      </div>
    </div>
  );
}
