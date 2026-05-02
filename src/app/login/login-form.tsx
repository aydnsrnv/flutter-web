'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Sms, Lock } from 'iconsax-react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import loginImg from '../login.png';

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
      <img src={loginImg.src} alt="login" className="mx-auto w-[269px] h-[269px] object-contain rounded-xl" />
      <div className="text-xl font-semibold text-foreground text-center">
        {t('login_welcome')}
      </div>
      <div className="text-sm text-foreground/80 text-center">
        {t('login_subtitle')}
      </div>

      {errorText ? <Alert variant="error">{errorText}</Alert> : null}
      {successText ? <Alert variant="success">{successText}</Alert> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <div className="relative">
            <Sms
              size={18}
              variant="Linear"
              color="currentColor"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary"
            />
            <Input
              name="email"
              type="email"
              required
              placeholder={t('email')}
              className="pl-11"
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              variant="Linear"
              color="currentColor"
              className="absolute left-4 top-3 z-10 text-primary"
            />
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('password')}
              className="pr-12 pl-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center text-muted-foreground"
              aria-label={t('toggle_password_visibility')}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="-mt-1 text-right text-sm">
            <Link href="/forgot-password" className="font-semibold text-foreground">
              {t('forgot_password')}
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
          >
            {t('login')}
          </Button>

          <div className="mt-2 text-center text-sm text-foreground/70">
            {t('no_account')}{' '}
            <Link href="/signup" className="font-semibold text-foreground">
              {t('signup')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
