import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { ChangePasswordForm } from './change-password-form';
import { changePassword } from './actions';

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <ChangePasswordForm
      action={changePassword}
      errorKey={searchParams?.error}
      successKey={searchParams?.success}
    />
  );
}
