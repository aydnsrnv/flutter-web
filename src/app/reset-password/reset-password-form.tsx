'use client';

import { useMemo } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function ResetPasswordForm({
  action,
  errorKey,
  successKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
  successKey?: string;
}) {
  const { t } = useI18n();

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
      <div className="text-xl font-semibold text-primary">
        {t('verify_code_title')}
      </div>
      <div className="text-sm text-foreground/60">
        {t('reset_password_code_sent')}
      </div>

      {errorText ? <Alert variant="error">{errorText}</Alert> : null}
      {successText ? <Alert variant="success">{successText}</Alert> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <Input
            name="code"
            required
            placeholder={t('reset_token_required')}
          />

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
          >
            {t('verify_code')}
          </Button>

          <div className="mt-2 text-center text-sm text-foreground/60">
            <a href="/login" className="font-semibold text-primary">
              {t('login')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
