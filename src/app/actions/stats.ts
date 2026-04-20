'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function incrementJobViewCount(jobId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('jobs').select('view_count').eq('id', jobId).single();
    if (data) {
      await admin.from('jobs').update({ view_count: (data.view_count || 0) + 1 }).eq('id', jobId);
    }
  } catch (err) {
    // ignore
  }
}

export async function incrementResumeViewCount(resumeId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('resumes').select('view_count').eq('id', resumeId).single();
    if (data) {
      await admin.from('resumes').update({ view_count: (data.view_count || 0) + 1 }).eq('id', resumeId);
    }
  } catch (err) {
    // ignore
  }
}

export async function incrementJobAppliedCount(jobId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('jobs').select('applied_count').eq('id', jobId).single();
    if (data) {
      await admin.from('jobs').update({ applied_count: (data.applied_count || 0) + 1 }).eq('id', jobId);
    }
  } catch (err) {
    // ignore
  }
}

export async function incrementResumeAppliedCount(resumeId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('resumes').select('applied_count').eq('id', resumeId).single();
    if (data) {
      await admin.from('resumes').update({ applied_count: (data.applied_count || 0) + 1 }).eq('id', resumeId);
    }
  } catch (err) {
    // ignore
  }
}

export type StatsData = {
  jobs: { total: number; today: number; thisWeek: number; thisMonth: number };
  resumes: { total: number; today: number; thisWeek: number; thisMonth: number };
};

export async function getStatsData(): Promise<StatsData> {
  const admin = createAdminClient();
  const now = new Date();

  // Date boundaries
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay(); // 0=Sun
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  async function count(table: string, filter?: { from?: string; to?: string; status?: boolean }) {
    let query = admin.from(table).select('id', { count: 'exact', head: true });
    if (filter?.status !== undefined) query = query.eq('status', filter.status);
    if (filter?.from) query = query.gte('create_time', filter.from);
    if (filter?.to) query = query.lt('create_time', filter.to);
    const { count: c } = await query;
    return c ?? 0;
  }

  const todayStr = startOfToday.toISOString();
  const weekStr = startOfWeek.toISOString();
  const monthStr = startOfMonth.toISOString();

  const [
    jobsTotal,
    jobsToday,
    jobsWeek,
    jobsMonth,
    resumesTotal,
    resumesToday,
    resumesWeek,
    resumesMonth,
  ] = await Promise.all([
    count('jobs', { status: true }),
    count('jobs', { from: todayStr }),
    count('jobs', { from: weekStr }),
    count('jobs', { from: monthStr }),
    count('resumes', { status: true }),
    count('resumes', { from: todayStr }),
    count('resumes', { from: weekStr }),
    count('resumes', { from: monthStr }),
  ]);

  return {
    jobs: { total: jobsTotal, today: jobsToday, thisWeek: jobsWeek, thisMonth: jobsMonth },
    resumes: { total: resumesTotal, today: resumesToday, thisWeek: resumesWeek, thisMonth: resumesMonth },
  };
}

