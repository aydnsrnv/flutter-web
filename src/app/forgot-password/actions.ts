'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function sendResetCode(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent('enter_email')}`);
  }

  const supabase = await createClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    redirect(`/forgot-password?error=${encodeURIComponent('reset_password_error')}`);
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
      body: JSON.stringify({ email }),
    });

    payload = await res.json().catch(() => ({}));

    if (!res.ok || !payload?.success) {
      const errStr = String(payload?.error ?? '').toLowerCase();
      console.error('[forgot-password] reset-password function error', {
        status: res.status,
        payload,
      });
      if (errStr.includes('too many') || errStr.includes('rate')) {
        redirect(`/forgot-password?error=${encodeURIComponent('reset_password_rate_limit')}`);
      }
      if (errStr.includes('email not found')) {
        redirect(`/forgot-password?error=${encodeURIComponent('email_not_found')}`);
      }
      const detail = payload?.error ? `reset_password_error: ${String(payload.error)}` : 'reset_password_error';
      redirect(`/forgot-password?error=${encodeURIComponent(detail)}`);
    }
  } catch {
    redirect(`/forgot-password?error=${encodeURIComponent('reset_password_error')}`);
  }

  const token = String(payload?.token ?? '').trim();
  const code = String(payload?.code ?? '').trim();

  if (!token || !code) {
    redirect(`/forgot-password?error=${encodeURIComponent('reset_password_error')}`);
  }

  const cookieStore = await cookies();
  cookieStore.set('jobly_reset_email', email, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 });
  cookieStore.set('jobly_reset_token', token, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 });
  cookieStore.set('jobly_reset_code', code, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 });

  // touch session cookies (matching other server flows)
  await supabase.auth.getUser();

  redirect(`/reset-password?email=${encodeURIComponent(email)}&success=${encodeURIComponent('reset_password_code_sent')}`);
}
