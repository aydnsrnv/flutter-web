import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { signup } from './actions';
import { SignupForm } from './signup-form';

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/me');
  }

  const sp = await Promise.resolve(searchParams ?? {});
  const error = sp?.error;

  return <SignupForm action={signup} errorKey={error} />;
}
