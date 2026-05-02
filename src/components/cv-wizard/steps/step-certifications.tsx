'use client';

import { Trash } from 'iconsax-react';
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

export function StepCertifications() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        {data.certifications.map((c, idx) => (
          <div key={idx} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                {t('resume_wizard_certification_item_title').replace('{index}', String(idx + 1))}
              </div>
              {data.certifications.length > 1 ? (
                <button
                  type="button"
                  onClick={() => updateData({ certifications: data.certifications.filter((_, i) => i !== idx) })}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                >
                  <Trash size={18} variant="Linear" className="text-red-500" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3">
              <Input
                value={String(c.name ?? '')}
                onChange={(ev) => {
                  const copy = data.certifications.slice();
                  copy[idx] = { ...copy[idx], name: stripEmojis(ev.target.value) };
                  updateData({ certifications: copy });
                }}
                placeholder={t('resume_wizard_hint_certification_name')}
              />
              <Input
                value={String(c.issuer ?? '')}
                onChange={(ev) => {
                  const copy = data.certifications.slice();
                  copy[idx] = { ...copy[idx], issuer: stripEmojis(ev.target.value) };
                  updateData({ certifications: copy });
                }}
                placeholder={t('resume_wizard_hint_certification_issuer')}
              />
              <Input
                value={c.year == null ? '' : String(c.year)}
                onChange={(ev) => {
                  const copy = data.certifications.slice();
                  copy[idx] = { ...copy[idx], year: ev.target.value ? Number(ev.target.value) : undefined };
                  updateData({ certifications: copy });
                }}
                placeholder={t('resume_wizard_hint_certification_year')}
                inputMode="numeric"
              />
              <Input
                value={String(c.description ?? '')}
                onChange={(ev) => {
                  const copy = data.certifications.slice();
                  copy[idx] = { ...copy[idx], description: stripEmojis(ev.target.value) };
                  updateData({ certifications: copy });
                }}
                placeholder={t('resume_wizard_hint_certification_description')}
              />
            </div>
          </div>
        ))}

        {data.certifications.length < 5 ? (
          <button
            type="button"
            onClick={() => updateData({ certifications: data.certifications.concat({ name: '', issuer: '', year: undefined, description: '' }) })}
            className="h-12 rounded-2xl border border-border bg-white text-sm font-semibold text-primary"
          >
            {t('resume_wizard_add_certification')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
