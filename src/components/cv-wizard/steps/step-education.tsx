'use client';

import { useMemo } from 'react';
import { Trash } from 'iconsax-react';
import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
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

export function StepEducation() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  const educationKeys = useMemo(() => ['education_higher', 'education_incomplete_higher', 'education_secondary_special'], []);

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <SingleSelectDropdown
          value={data.educationLevelKey}
          onChange={(v) => updateData({ educationLevelKey: v })}
          placeholder={t('resume_wizard_select_education_level')}
          options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
        />

        {data.educations.map((e, idx) => (
          <div key={idx} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                {t('resume_wizard_education_item_title').replace('{index}', String(idx + 1))}
              </div>
              {data.educations.length > 1 ? (
                <button
                  type="button"
                  onClick={() => updateData({ educations: data.educations.filter((_, i) => i !== idx) })}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                >
                  <Trash size={18} variant="Linear" className="text-red-500" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3">
              <Input
                value={String(e.institution ?? '')}
                onChange={(ev) => {
                  const copy = data.educations.slice();
                  copy[idx] = { ...copy[idx], institution: stripEmojis(ev.target.value) };
                  updateData({ educations: copy });
                }}
                placeholder={t('resume_wizard_hint_education_institution')}
              />
              <Input
                value={String(e.degree ?? '')}
                onChange={(ev) => {
                  const copy = data.educations.slice();
                  copy[idx] = { ...copy[idx], degree: stripEmojis(ev.target.value) };
                  updateData({ educations: copy });
                }}
                placeholder={t('resume_wizard_hint_education_degree')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={(e as any).start_year == null ? '' : String((e as any).start_year)}
                  onChange={(ev) => {
                    const copy = data.educations.slice();
                    copy[idx] = { ...copy[idx], start_year: ev.target.value ? Number(ev.target.value) : undefined } as any;
                    updateData({ educations: copy });
                  }}
                  placeholder={t('resume_wizard_hint_start_year')}
                  inputMode="numeric"
                />
                <Input
                  value={(e as any).end_year == null ? '' : String((e as any).end_year)}
                  onChange={(ev) => {
                    const copy = data.educations.slice();
                    copy[idx] = { ...copy[idx], end_year: ev.target.value ? Number(ev.target.value) : undefined } as any;
                    updateData({ educations: copy });
                  }}
                  placeholder={t('resume_wizard_hint_end_year')}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        ))}

        {data.educations.length < 5 ? (
          <button
            type="button"
            onClick={() => updateData({ educations: data.educations.concat({ institution: '', degree: '' }) })}
            className="h-12 rounded-2xl border border-border bg-white text-sm font-semibold text-primary"
          >
            {t('resume_wizard_add_education')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
