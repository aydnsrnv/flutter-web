'use client';

import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n/client';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

export function StepAbout() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2">
        <Textarea
          value={data.about}
          onChange={(e) => updateData({ about: stripEmojis(e.target.value) })}
          placeholder={t('resume_wizard_hint_about')}
          className="min-h-[160px] rounded-2xl"
        />
      </div>
    </div>
  );
}
