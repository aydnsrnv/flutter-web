'use client';

import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function NewPasswordForm({
  action,
  errorKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
}) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6">
      <div className="mb-6">
        <div className="text-xl font-bold text-foreground">
          {t('reset_new_password')}
        </div>
        <div className="mt-1 text-sm text-foreground/60">
          {t('reset_new_password_info')}
        </div>
      </div>

      {errorText ? <Alert variant="error" className="mb-4">{errorText}</Alert> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('new_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_password_visibility')}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="relative">
            <Input
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder={t('confirm_new_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_confirm_password_visibility')}
            >
              <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
          >
            {t('reset_confirm')}
          </Button>
        </form>
      </div>
    </div>
  );
}
