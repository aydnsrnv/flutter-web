import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { sendResetCode } from './actions';
import { ForgotPasswordForm } from './forgot-password-form';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/me');
  }

  const errorKey = searchParams?.error;
  return <ForgotPasswordForm action={sendResetCode} errorKey={errorKey} />;
}
