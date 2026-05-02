'use client';

import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/client';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function sanitizeNumber(input: string) {
  return stripEmojis(input).replace(/-/g, '').replace(/[^0-9]/g, '');
}

export function StepBasic() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <Input
          value={data.desiredPosition}
          onChange={(e) => updateData({ desiredPosition: stripEmojis(e.target.value) })}
          placeholder={t('resume_wizard_hint_desired_position')}
        />
        <Input
          value={data.desiredSalary}
          onChange={(e) => updateData({ desiredSalary: sanitizeNumber(e.target.value) })}
          placeholder={t('resume_wizard_hint_desired_salary')}
          inputMode="numeric"
        />
      </div>
    </div>
  );
}
