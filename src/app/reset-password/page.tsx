import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { verifyResetCode } from './actions';
import { ResetPasswordForm } from './reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { email?: string; error?: string; success?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/me');
  }

  return (
    <ResetPasswordForm
      action={verifyResetCode}
      errorKey={searchParams?.error}
      successKey={searchParams?.success}
    />
  );
}
