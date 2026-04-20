'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function verifyResetCode(formData: FormData) {
  const token = String(formData.get('code') ?? '').trim();

  if (!token) {
    redirect(`/reset-password?error=${encodeURIComponent('reset_token_required')}`);
  }

  await createClient();

  const cookieStore = await cookies();
  const savedEmail = String(cookieStore.get('jobly_reset_email')?.value ?? '').trim();
  const savedToken = String(cookieStore.get('jobly_reset_token')?.value ?? '').trim();
  const savedCode = String(cookieStore.get('jobly_reset_code')?.value ?? '').trim();

  if (!savedEmail || !savedToken || !savedCode) {
    redirect(`/reset-password?error=${encodeURIComponent('reset_password_error')}`);
  }

  if (token !== savedCode) {
    redirect(`/reset-password?error=${encodeURIComponent('verificationCodeInvalid')}`);
  }

  cookieStore.set('jobly_reset_verified', '1', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 });

  redirect('/reset-password/new');
}

export async function setNewPassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');

  if (!password) {
    redirect(`/reset-password/new?error=${encodeURIComponent('signup_password_required')}`);
  }
  if (password.length < 6) {
    redirect(`/reset-password/new?error=${encodeURIComponent('password_min_length')}`);
  }
  if (!confirmPassword) {
    redirect(`/reset-password/new?error=${encodeURIComponent('enter_confirm_password')}`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password/new?error=${encodeURIComponent('passwords_do_not_match')}`);
  }

  await createClient();

  const cookieStore = await cookies();
  const verified = String(cookieStore.get('jobly_reset_verified')?.value ?? '');
  const email = String(cookieStore.get('jobly_reset_email')?.value ?? '').trim();
  const resetToken = String(cookieStore.get('jobly_reset_token')?.value ?? '').trim();

  if (verified !== '1' || !email || !resetToken) {
    redirect('/login');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    redirect(`/reset-password/new?error=${encodeURIComponent('reset_password_error')}`);
  }

  const functionUrl = `${url}/functions/v1/reset-password`;
  let payload: any = null;
  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ email, token: resetToken, new_password: password }),
    });

    payload = await res.json().catch(() => ({}));

    if (!res.ok || !payload?.success) {
      redirect(`/reset-password/new?error=${encodeURIComponent('reset_password_error')}`);
    }
  } catch {
    redirect(`/reset-password/new?error=${encodeURIComponent('reset_password_error')}`);
  }

  // clear cookies
  cookieStore.set('jobly_reset_email', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  cookieStore.set('jobly_reset_token', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  cookieStore.set('jobly_reset_code', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  cookieStore.set('jobly_reset_verified', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });

  redirect(`/login?success=${encodeURIComponent('reset_password_success')}`);
}
