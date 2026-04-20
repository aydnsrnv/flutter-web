import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

import { setNewPassword } from '../actions';
import { NewPasswordForm } from './new-password-form';

export default async function ResetPasswordNewPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await createClient();
  const cookieStore = await cookies();
  const verified = String(cookieStore.get('jobly_reset_verified')?.value ?? '');
  const email = String(cookieStore.get('jobly_reset_email')?.value ?? '').trim();
  const resetToken = String(cookieStore.get('jobly_reset_token')?.value ?? '').trim();

  if (verified !== '1' || !email || !resetToken) {
    redirect('/reset-password');
  }

  return <NewPasswordForm action={setNewPassword} errorKey={searchParams?.error} />;
}
