'use client';

import { Call, Sms } from 'iconsax-react';
import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/client';

const mainColor = 'var(--jobly-main)';

export function StepContact() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <div className="relative">
          <Sms size={18} variant="Linear" className="absolute left-4 top-1/2 -translate-y-1/2 z-10" color={mainColor} />
          <Input
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder={t('resume_wizard_hint_email')}
            className="pl-11 pr-4"
          />
        </div>
        <div className="relative">
          <Call size={18} variant="Linear" className="absolute left-4 top-1/2 -translate-y-1/2 z-10" color={mainColor} />
          <Input
            value={data.phone}
            onChange={(e) => {
              let v = (e.target.value ?? '').replace(/\D/g, '');
              if (!v.startsWith('0')) v = '0' + v;
              if (v.length > 10) v = v.slice(0, 10);
              updateData({ phone: v });
            }}
            placeholder={t('resume_wizard_hint_phone_optional')}
            className="pl-11 pr-4"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );
}
