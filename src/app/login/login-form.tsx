'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mainColor = '#245BEB';

export function LoginForm({
  action,
  error,
  successKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  successKey?: string;
}) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  const errorText = useMemo(() => {
    const e = (error ?? '').trim();
    if (!e) return '';
    const lower = e.toLowerCase();
    if (lower.includes('invalid login credentials')) return t('login_error_invalid');
    if (lower.includes('email not confirmed')) return t('login_error_unconfirmed');
    return e;
  }, [error, t]);

  const successText = useMemo(() => {
    const k = (successKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [successKey, t]);

  return (
    <div className="flex flex-col gap-4">
      {/* Page title — same style as SectionHeader */}
      <div className="text-xl font-semibold" style={{ color: mainColor }}>
        {t('login_welcome')}
      </div>
      <div className="text-[14px] text-foreground/60">
        {t('login_subtitle')}
      </div>

      {errorText ? (
        <div
          className="rounded-2xl border px-4 py-3 text-[14px]"
          style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.22)' }}
        >
          {errorText}
        </div>
      ) : null}

      {successText ? (
        <div
          className="rounded-2xl border px-4 py-3 text-[14px]"
          style={{ color: '#16A34A', backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}
        >
          {successText}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <Input
            name="email"
            type="email"
            required
            placeholder={t('email')}
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_password_visibility')}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="-mt-1 text-right text-[14px]">
            <Link href="/forgot-password" className="font-semibold" style={{ color: mainColor }}>
              {t('forgot_password')}
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-2xl text-[16px] font-bold shadow-lg shadow-primary/20"
          >
            {t('login')}
          </Button>

          <div className="mt-2 text-center text-[14px] text-foreground/60">
            {t('no_account')}{' '}
            <Link href="/signup" className="font-semibold" style={{ color: mainColor }}>
              {t('signup')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
