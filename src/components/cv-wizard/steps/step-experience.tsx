'use client';

import { useMemo } from 'react';
import { Trash } from 'iconsax-react';
import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n/client';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

export function StepExperience() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  const isNoExperience = data.experienceLevelKey === 'exp_none';

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const keyMap = ['month_january','month_february','month_march','month_april','month_may','month_june','month_july','month_august','month_september','month_october','month_november','month_december'];
      return { value: String(i + 1), label: t(keyMap[i]) };
    });
  }, [t]);

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        {/* No experience checkbox */}
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border">
            <input
              type="checkbox"
              checked={isNoExperience}
              onChange={(e) => {
                const checked = e.target.checked;
                updateData({
                  experienceLevelKey: checked ? 'exp_none' : '',
                  // reset experiences when checking "no experience"
                  experiences: checked
                    ? [{ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }]
                    : data.experiences,
                });
              }}
              className="peer h-full w-full cursor-pointer appearance-none rounded"
            />
            <i className="ri-check-line pointer-events-none absolute hidden text-sm text-primary peer-checked:block" />
          </div>
          <span className="text-sm font-semibold text-foreground">{t('exp_none')}</span>
        </label>

        {/* Experience cards — hidden when "no experience" is checked */}
        {!isNoExperience && (
          <>
            {data.experiences.map((e, idx) => (
              <div key={idx} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">
                    {t('resume_wizard_experience_item_title').replace('{index}', String(idx + 1))}
                  </div>
                  {data.experiences.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => updateData({ experiences: data.experiences.filter((_, i) => i !== idx) })}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                    >
                      <Trash size={18} variant="Linear" className="text-red-500" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3">
                  <Input
                    value={String(e.company ?? '')}
                    onChange={(ev) => {
                      const copy = data.experiences.slice();
                      copy[idx] = { ...copy[idx], company: stripEmojis(ev.target.value) };
                      updateData({ experiences: copy });
                    }}
                    placeholder={t('resume_wizard_hint_company_name')}
                  />
                  <Input
                    value={String(e.position ?? '')}
                    onChange={(ev) => {
                      const copy = data.experiences.slice();
                      copy[idx] = { ...copy[idx], position: stripEmojis(ev.target.value) };
                      updateData({ experiences: copy });
                    }}
                    placeholder={t('resume_wizard_hint_position')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <SingleSelectDropdown
                      value={(e as any).start_month == null ? '' : String((e as any).start_month)}
                      onChange={(v) => {
                        const copy = data.experiences.slice();
                        copy[idx] = { ...copy[idx], start_month: v ? Number(v) : undefined } as any;
                        updateData({ experiences: copy });
                      }}
                      placeholder={t('month_short')}
                      options={monthOptions}
                    />
                    <Input
                      value={(e as any).start_year == null ? '' : String((e as any).start_year)}
                      onChange={(ev) => {
                        const copy = data.experiences.slice();
                        copy[idx] = { ...copy[idx], start_year: ev.target.value ? Number(ev.target.value) : undefined } as any;
                        updateData({ experiences: copy });
                      }}
                      placeholder={t('resume_wizard_hint_start_year')}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SingleSelectDropdown
                      value={(e as any).end_month == null ? '' : String((e as any).end_month)}
                      onChange={(v) => {
                        const copy = data.experiences.slice();
                        copy[idx] = { ...copy[idx], end_month: v ? Number(v) : undefined } as any;
                        updateData({ experiences: copy });
                      }}
                      placeholder={t('month_short')}
                      options={monthOptions}
                    />
                    <Input
                      value={(e as any).end_year == null ? '' : String((e as any).end_year)}
                      onChange={(ev) => {
                        const copy = data.experiences.slice();
                        copy[idx] = { ...copy[idx], end_year: ev.target.value ? Number(ev.target.value) : undefined } as any;
                        updateData({ experiences: copy });
                      }}
                      placeholder={t('resume_wizard_hint_end_year')}
                      inputMode="numeric"
                    />
                  </div>
                  <Textarea
                    value={String(e.description ?? '')}
                    onChange={(ev) => {
                      const copy = data.experiences.slice();
                      copy[idx] = { ...copy[idx], description: stripEmojis(ev.target.value) };
                      updateData({ experiences: copy });
                    }}
                    placeholder={t('resume_wizard_hint_experience_description')}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
              </div>
            ))}

            {data.experiences.length < 5 ? (
              <button
                type="button"
                onClick={() =>
                  updateData({
                    experiences: data.experiences.concat({
                      company: '', position: '', start_year: undefined, start_month: undefined,
                      end_year: undefined, end_month: undefined, description: '',
                    }),
                  })
                }
                className="h-12 rounded-2xl border border-border bg-white text-sm font-semibold text-primary"
              >
                {t('resume_wizard_add_experience')}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
