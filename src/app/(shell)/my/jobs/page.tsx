import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SectionHeader } from '@/components/section-header';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';

import { MyJobsClient } from '@/app/(shell)/my/jobs/my-jobs-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
  status?: boolean | null;
  is_premium?: boolean | null;
  creator_id?: string | null;
};

export default async function MyJobsPage({
  searchParams,
}: {
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const sp = await Promise.resolve(searchParams);
  const tab = (sp?.tab ?? 'active').toString();
  const isActive = tab !== 'inactive';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  if (!uid) redirect('/login');

  const { data, error } = await supabase
    .from('jobs')
    .select('id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary, status, is_premium, creator_id')
    .eq('creator_id', uid)
    .eq('status', isActive)
    .order('create_time', { ascending: false })
    .limit(20);

  const jobs = (data ?? []) as JobRow[];

  const limit = 20;

  return (
    <div className="flex flex-col">
      <div className="mt-[18px] mb-1">
        <div className="flex gap-0 rounded-full border border-border bg-card p-1">
          <Link
            href="/my/jobs?tab=active"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${isActive ? 'bg-primary/12 font-bold text-primary' : 'font-semibold text-foreground'}`}
          >
            {t('my_jobs_tab_active')}
          </Link>
          <Link
            href="/my/jobs?tab=inactive"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${!isActive ? 'bg-primary/12 font-bold text-primary' : 'font-semibold text-foreground'}`}
          >
            {t('my_jobs_tab_inactive')}
          </Link>
        </div>
      </div>

      <div className="mt-[6px]">
        {error ? (
          <div className="rounded-lg bg-background px-4 py-6 text-center text-[16px] text-foreground">{error.message}</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg bg-background px-4 py-6 text-center text-[16px] text-foreground">{t('my_jobs_empty')}</div>
        ) : (
          <MyJobsClient initialJobs={jobs} initialHasMore={jobs.length >= limit} limit={limit} isActive={isActive} />
        )}
      </div>
    </div>
  );
}
