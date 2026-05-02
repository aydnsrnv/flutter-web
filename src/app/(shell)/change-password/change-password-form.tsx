'use client';

import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { SectionHeader } from '@/components/section-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function ChangePasswordForm({
  action,
  errorKey,
  successKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
  successKey?: string;
}) {
  const { t } = useI18n();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  const successText = useMemo(() => {
    const k = (successKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [successKey, t]);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t('change_password')} />
      <div className="text-sm text-foreground/60">
        {t('change_password_description')}
      </div>

      {errorText ? <Alert variant="error" className="mb-4">{errorText}</Alert> : null}
      {successText ? <Alert variant="success" className="mb-4">{successText}</Alert> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <div className="relative">
            <Input
              name="current_password"
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder={t('enter_current_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_current_password_visibility')}
            >
              <i className={showCurrent ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="relative">
            <Input
              name="new_password"
              type={showNew ? 'text' : 'password'}
              required
              placeholder={t('enter_new_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_new_password_visibility')}
            >
              <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="relative">
            <Input
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder={t('enter_confirm_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_confirm_password_visibility')}
            >
              <i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
          >
            {t('change_password')}
          </Button>

          <div className="mt-2 text-center text-sm text-foreground/60">
            <a href="/profile" className="font-semibold text-primary">
              {t('profile_title')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
