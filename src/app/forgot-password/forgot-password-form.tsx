'use client';

import { useMemo } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function ForgotPasswordForm({
  action,
  errorKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
}) {
  const { t } = useI18n();

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-semibold text-primary">
        {t('reset_title')}
      </div>
      <div className="text-sm text-muted-foreground">
        {t('reset_info')}
      </div>

      {errorText ? <Alert variant="error">{errorText}</Alert> : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <Input
            name="email"
            type="email"
            required
            placeholder={t('email')}
          />

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
          >
            {t('reset_send')}
          </Button>

          <div className="mt-2 text-center text-sm text-muted-foreground">
            <a href="/login" className="font-semibold text-primary">
              {t('login')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
