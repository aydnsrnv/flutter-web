import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function CreateGatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', user.id)
    .maybeSingle();

  const userType = (data?.user_type ?? '').toString().toLowerCase();

  if (!error && userType === 'employer') {
    redirect('/create/job/add');
  }

  redirect('/create/resume/add');
}
