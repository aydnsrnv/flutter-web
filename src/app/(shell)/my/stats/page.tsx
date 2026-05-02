import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
import { redirect } from 'next/navigation';
import { EmployerStatsDashboard } from '@/components/employer-stats-dashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

export default async function MyStatsPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  if (!uid) {
    redirect('/login');
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', uid)
    .maybeSingle();

  const userType = (userRow?.user_type ?? '').toLowerCase();
  const isCandidate = userType === 'candidate';

  if (isCandidate) {
    redirect('/profile');
  }

  let postedJobsCount = 0;
  let appliedCount = 0;
  let totalViewCount = 0;
  let employerJobs: Array<{
    id: string;
    title: string;
    city?: string | null;
    min_salary?: string | null;
    max_salary?: string | null;
    create_time?: string | null;
    view_count?: number | null;
    applied_count?: number | null;
  }> = [];

  const { data: jobStats, error: statsErr } = await supabase
    .from('jobs')
    .select('id, title, city, min_salary, max_salary, create_time, view_count, applied_count')
    .eq('creator_id', uid)
    .eq('status', true)
    .order('create_time', { ascending: false })
    .limit(5000);

  if (!statsErr && jobStats) {
    const list = Array.isArray(jobStats) ? jobStats : [];
    employerJobs = list as typeof employerJobs;
    postedJobsCount = list.length;
    for (const j of list) {
      const v = (j as any)?.view_count;
      const a = (j as any)?.applied_count;
      totalViewCount += typeof v === 'number' ? v : Number(v) || 0;
      appliedCount += typeof a === 'number' ? a : Number(a) || 0;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-2 pb-1">
        <div className="text-xl font-bold text-foreground">
          {t('statistics') || 'Statistikalar'}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {t('stats_subtitle') || 'İlan performansınızı ve istatistiklerinizi görüntüleyin'}
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <EmployerStatsDashboard
          jobs={employerJobs}
          totalViews={totalViewCount}
          totalApplied={appliedCount}
          jobsCount={postedJobsCount}
        />
      </Suspense>
    </div>
  );
}
