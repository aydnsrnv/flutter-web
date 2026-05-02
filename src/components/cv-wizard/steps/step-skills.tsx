'use client';

import { useMemo, useState } from 'react';
import { CloseCircle } from 'iconsax-react';
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

export function StepSkills() {
  const { t } = useI18n();
  const { data, updateData, addLanguageWithLevel, removeLanguage, selectedLanguages } = useCvWizard();
  const [pendingLanguageKey, setPendingLanguageKey] = useState('');

  const languageOptions = useMemo(
    () => [
      'resume_wizard_lang_azerbaijani',
      'resume_wizard_lang_english',
      'resume_wizard_lang_russian',
      'resume_wizard_lang_turkish',
      'resume_wizard_lang_german',
      'resume_wizard_lang_french',
      'resume_wizard_lang_spanish',
      'resume_wizard_lang_portuguese',
      'resume_wizard_lang_italian',
      'resume_wizard_lang_arabic',
      'resume_wizard_lang_persian',
      'resume_wizard_lang_chinese',
      'resume_wizard_lang_korean',
      'resume_wizard_lang_hindi',
    ],
    [],
  );

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <Input
          value={data.skills}
          onChange={(e) => updateData({ skills: stripEmojis(e.target.value) })}
          placeholder={t('resume_wizard_hint_skills')}
        />

        <div className="rounded-2xl border border-border p-3">
          <div className="text-sm font-semibold text-foreground">{t('resume_wizard_label_languages')}</div>
          <div className="mt-3 grid gap-3">
            <SingleSelectDropdown
              value={pendingLanguageKey}
              onChange={(v) => setPendingLanguageKey(v)}
              placeholder={t('resume_wizard_select_language')}
              options={languageOptions.map((k) => ({ value: k, label: t(k) }))}
            />

            {pendingLanguageKey ? (
              <SingleSelectDropdown
                value=""
                onChange={(lvl) => {
                  if (!pendingLanguageKey || !lvl) return;
                  addLanguageWithLevel(pendingLanguageKey, lvl);
                  setPendingLanguageKey('');
                }}
                placeholder={t('resume_wizard_sheet_select_language_level_title')}
                options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((k) => ({ value: k, label: k }))}
              />
            ) : null}

            {selectedLanguages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((l, idx) => (
                  <button
                    key={`${l}-${idx}`}
                    type="button"
                    onClick={() => removeLanguage(idx)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground/80"
                  >
                    {t(l.replace(/ \([A-C][12]\)$/, ''))} {l.match(/\(([A-C][12])\)/)?.[0] ?? ''}
                    <CloseCircle size={16} variant="Linear" className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
