'use client';

import { useMemo, useState } from 'react';
import { CloseCircle, Trash } from 'iconsax-react';
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

function SectionTitle({ title }: { title: string }) {
  return <div className="px-1 text-base font-bold text-foreground">{title}</div>;
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <SectionTitle title={title} />
      <div className="mt-3">{children}</div>
    </div>
  );
}

function LanguageSelector() {
  const { t } = useI18n();
  const { addLanguageWithLevel } = useCvWizard();
  const [pendingLanguageKey, setPendingLanguageKey] = useState('');

  const languageOptions = useMemo(
    () => [
      'resume_wizard_lang_azerbaijani', 'resume_wizard_lang_english', 'resume_wizard_lang_russian',
      'resume_wizard_lang_turkish', 'resume_wizard_lang_german', 'resume_wizard_lang_french',
      'resume_wizard_lang_spanish', 'resume_wizard_lang_portuguese', 'resume_wizard_lang_italian',
      'resume_wizard_lang_arabic', 'resume_wizard_lang_persian', 'resume_wizard_lang_chinese',
      'resume_wizard_lang_korean', 'resume_wizard_lang_hindi',
    ],
    [],
  );

  return (
    <>
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
    </>
  );
}

export function StepPreview() {
  const { t } = useI18n();
  const { data, updateData, addLanguageWithLevel, removeLanguage, selectedLanguages } = useCvWizard();

  const cityKeys = useMemo(
    () => [
      'city_baku', 'city_absheron', 'city_ganja', 'city_sumgait', 'city_mingechevir',
      'city_khankendi', 'city_lenkeran', 'city_sheki', 'city_shirvan', 'city_nakhchivan',
      'city_quba', 'city_qusar', 'city_qabala', 'city_zaqatala', 'city_shamakhi',
      'city_tovuz', 'city_agdam', 'city_fuzuli', 'city_shamkir', 'city_barda',
      'city_masalli', 'city_salyan', 'city_astara', 'city_yevlakh', 'city_qazakh',
      'city_gadabay', 'city_sabirabad', 'city_zardab', 'city_imishli', 'city_balakan',
      'city_saatli', 'city_ujar', 'city_beylagan', 'city_agjabadi', 'city_agdash',
      'city_hajigabul', 'city_gobustan', 'city_qakh', 'city_samukh', 'city_tartar',
      'city_khizi', 'city_goychay', 'city_kurdamir', 'city_siazan', 'city_aghstafa',
      'city_neftchala', 'city_shabran', 'city_lerik', 'city_yardimli', 'city_jalilabad',
      'city_aghdara', 'city_agsu', 'city_ali_bayramli', 'city_culfa', 'city_dashkasan',
      'city_goygol', 'city_goytepe', 'city_ismayilli', 'city_kalbajar', 'city_lachin',
      'city_naftalan', 'city_oguz', 'city_ordubad', 'city_garadag', 'city_qubadli',
      'city_shahbuz', 'city_sharur', 'city_shusha', 'city_khirdalan', 'city_khojali',
      'city_khojavend', 'city_khudat', 'city_zangilan',
    ],
    [],
  );

  const maritalStatuses = useMemo(() => ['single', 'married'], []);
  const genderKeys = useMemo(() => ['male', 'female'], []);
  const educationKeys = useMemo(() => ['education_higher', 'education_incomplete_higher', 'education_secondary_special'], []);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const keyMap = ['month_january','month_february','month_march','month_april','month_may','month_june','month_july','month_august','month_september','month_october','month_november','month_december'];
      return { value: String(i + 1), label: t(keyMap[i]) };
    });
  }, [t]);

  const languageOptions = useMemo(
    () => [
      'resume_wizard_lang_azerbaijani', 'resume_wizard_lang_english', 'resume_wizard_lang_russian',
      'resume_wizard_lang_turkish', 'resume_wizard_lang_german', 'resume_wizard_lang_french',
      'resume_wizard_lang_spanish', 'resume_wizard_lang_portuguese', 'resume_wizard_lang_italian',
      'resume_wizard_lang_arabic', 'resume_wizard_lang_persian', 'resume_wizard_lang_chinese',
      'resume_wizard_lang_korean', 'resume_wizard_lang_hindi',
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <PreviewCard title={t('resume_wizard_step_basic_title')}>
        <div className="grid gap-3">
          <Input
            value={data.desiredPosition}
            onChange={(e) => updateData({ desiredPosition: stripEmojis(e.target.value) })}
            placeholder={t('resume_wizard_hint_desired_position')}
          />
          <Input
            value={data.desiredSalary}
            onChange={(e) => updateData({ desiredSalary: stripEmojis(e.target.value).replace(/-/g, '').replace(/[^0-9]/g, '') })}
            placeholder={t('resume_wizard_hint_desired_salary')}
            inputMode="numeric"
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_demographics_title')}>
        <div className="grid gap-3">
          <Input
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder={t('resume_wizard_hint_full_name')}
          />
          <Input
            value={data.birthYear}
            onChange={(e) => {
              let v = (e.target.value ?? '').replace(/\D/g, '');
              if (v.length > 4) v = v.slice(0, 4);
              updateData({ birthYear: v });
            }}
            placeholder={t('resume_wizard_hint_birth_year')}
            inputMode="numeric"
          />
          <SingleSelectDropdown
            value={data.genderKey}
            onChange={(v) => updateData({ genderKey: v })}
            placeholder={t('gender')}
            options={genderKeys.map((k) => ({ value: k, label: t(k) }))}
          />
          <SingleSelectDropdown
            value={data.maritalStatus}
            onChange={(v) => updateData({ maritalStatus: v })}
            placeholder={t('resume_wizard_select_marital_status')}
            options={maritalStatuses.map((k) => ({ value: k, label: t(`marital_${k}`) }))}
          />
          <SingleSelectDropdown
            value={data.cityKey}
            onChange={(v) => updateData({ cityKey: v })}
            placeholder={t('resume_wizard_select_city')}
            searchPlaceholder={t('resume_wizard_hint_search_city')}
            options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_contact_title')}>
        <div className="grid gap-3">
          <Input
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder={t('resume_wizard_hint_email')}
          />
          <Input
            value={data.phone}
            onChange={(e) => {
              let v = (e.target.value ?? '').replace(/\D/g, '');
              if (!v.startsWith('0')) v = '0' + v;
              if (v.length > 10) v = v.slice(0, 10);
              updateData({ phone: v });
            }}
            placeholder={t('resume_wizard_hint_phone_optional')}
            inputMode="numeric"
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_education_title')}>
        <div className="grid gap-3">
          <SingleSelectDropdown
            value={data.educationLevelKey}
            onChange={(v) => updateData({ educationLevelKey: v })}
            placeholder={t('resume_wizard_select_education_level')}
            options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
          />
          {data.educations.map((e, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t('resume_wizard_education_item_title').replace('{index}', String(idx + 1))}</span>
                {data.educations.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => updateData({ educations: data.educations.filter((_, i) => i !== idx) })}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border"
                  >
                    <Trash size={16} variant="Linear" className="text-red-500" />
                  </button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2">
                <Input value={String(e.institution ?? '')} onChange={(ev) => { const copy = data.educations.slice(); copy[idx] = { ...copy[idx], institution: stripEmojis(ev.target.value) }; updateData({ educations: copy }); }} placeholder={t('resume_wizard_hint_education_institution')} />
                <Input value={String(e.degree ?? '')} onChange={(ev) => { const copy = data.educations.slice(); copy[idx] = { ...copy[idx], degree: stripEmojis(ev.target.value) }; updateData({ educations: copy }); }} placeholder={t('resume_wizard_hint_education_degree')} />
                <div className="grid grid-cols-2 gap-2">
                  <Input value={(e as any).start_year == null ? '' : String((e as any).start_year)} onChange={(ev) => { const copy = data.educations.slice(); copy[idx] = { ...copy[idx], start_year: ev.target.value ? Number(ev.target.value) : undefined } as any; updateData({ educations: copy }); }} placeholder={t('resume_wizard_hint_start_year')} inputMode="numeric" />
                  <Input value={(e as any).end_year == null ? '' : String((e as any).end_year)} onChange={(ev) => { const copy = data.educations.slice(); copy[idx] = { ...copy[idx], end_year: ev.target.value ? Number(ev.target.value) : undefined } as any; updateData({ educations: copy }); }} placeholder={t('resume_wizard_hint_end_year')} inputMode="numeric" />
                </div>
              </div>
            </div>
          ))}
          {data.educations.length < 5 ? (
            <button type="button" onClick={() => updateData({ educations: data.educations.concat({ institution: '', degree: '' }) })} className="h-10 rounded-xl border border-border text-sm font-semibold text-primary">{t('resume_wizard_add_education')}</button>
          ) : null}
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_experience_title')}>
        <div className="grid gap-3">
          {/* No experience checkbox in preview */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border">
              <input
                type="checkbox"
                checked={data.experienceLevelKey === 'exp_none'}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateData({
                    experienceLevelKey: checked ? 'exp_none' : '',
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

          {data.experienceLevelKey !== 'exp_none' && data.experiences.map((e, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t('resume_wizard_experience_item_title').replace('{index}', String(idx + 1))}</span>
                {data.experiences.length > 1 ? (
                  <button type="button" onClick={() => updateData({ experiences: data.experiences.filter((_, i) => i !== idx) })} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Trash size={16} variant="Linear" className="text-red-500" /></button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2">
                <Input value={String(e.company ?? '')} onChange={(ev) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], company: stripEmojis(ev.target.value) }; updateData({ experiences: copy }); }} placeholder={t('resume_wizard_hint_company_name')} />
                <Input value={String(e.position ?? '')} onChange={(ev) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], position: stripEmojis(ev.target.value) }; updateData({ experiences: copy }); }} placeholder={t('resume_wizard_hint_position')} />
                <div className="grid grid-cols-2 gap-2">
                  <SingleSelectDropdown value={(e as any).start_month == null ? '' : String((e as any).start_month)} onChange={(v) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], start_month: v ? Number(v) : undefined } as any; updateData({ experiences: copy }); }} placeholder={t('month_short')} options={monthOptions} />
                  <Input value={(e as any).start_year == null ? '' : String((e as any).start_year)} onChange={(ev) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], start_year: ev.target.value ? Number(ev.target.value) : undefined } as any; updateData({ experiences: copy }); }} placeholder={t('resume_wizard_hint_start_year')} inputMode="numeric" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SingleSelectDropdown value={(e as any).end_month == null ? '' : String((e as any).end_month)} onChange={(v) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], end_month: v ? Number(v) : undefined } as any; updateData({ experiences: copy }); }} placeholder={t('month_short')} options={monthOptions} />
                  <Input value={(e as any).end_year == null ? '' : String((e as any).end_year)} onChange={(ev) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], end_year: ev.target.value ? Number(ev.target.value) : undefined } as any; updateData({ experiences: copy }); }} placeholder={t('resume_wizard_hint_end_year')} inputMode="numeric" />
                </div>
                <Textarea value={String(e.description ?? '')} onChange={(ev) => { const copy = data.experiences.slice(); copy[idx] = { ...copy[idx], description: stripEmojis(ev.target.value) }; updateData({ experiences: copy }); }} placeholder={t('resume_wizard_hint_experience_description')} className="min-h-[80px] rounded-xl" />
              </div>
            </div>
          ))}
          {data.experiences.length < 5 && data.experienceLevelKey !== 'exp_none' ? (
            <button type="button" onClick={() => updateData({ experiences: data.experiences.concat({ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }) })} className="h-10 rounded-xl border border-border text-sm font-semibold text-primary">{t('resume_wizard_add_experience')}</button>
          ) : null}
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_certifications_title')}>
        <div className="grid gap-3">
          {data.certifications.map((c, idx) => (
            <div key={idx} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t('resume_wizard_certification_item_title').replace('{index}', String(idx + 1))}</span>
                {data.certifications.length > 1 ? (
                  <button type="button" onClick={() => updateData({ certifications: data.certifications.filter((_, i) => i !== idx) })} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Trash size={16} variant="Linear" className="text-red-500" /></button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2">
                <Input value={String(c.name ?? '')} onChange={(ev) => { const copy = data.certifications.slice(); copy[idx] = { ...copy[idx], name: stripEmojis(ev.target.value) }; updateData({ certifications: copy }); }} placeholder={t('resume_wizard_hint_certification_name')} />
                <Input value={String(c.issuer ?? '')} onChange={(ev) => { const copy = data.certifications.slice(); copy[idx] = { ...copy[idx], issuer: stripEmojis(ev.target.value) }; updateData({ certifications: copy }); }} placeholder={t('resume_wizard_hint_certification_issuer')} />
                <Input value={c.year == null ? '' : String(c.year)} onChange={(ev) => { const copy = data.certifications.slice(); copy[idx] = { ...copy[idx], year: ev.target.value ? Number(ev.target.value) : undefined }; updateData({ certifications: copy }); }} placeholder={t('resume_wizard_hint_certification_year')} inputMode="numeric" />
              </div>
            </div>
          ))}
          {data.certifications.length < 5 ? (
            <button type="button" onClick={() => updateData({ certifications: data.certifications.concat({ name: '', issuer: '', year: undefined, description: '' }) })} className="h-10 rounded-xl border border-border text-sm font-semibold text-primary">{t('resume_wizard_add_certification')}</button>
          ) : null}
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_skills_title')}>
        <div className="grid gap-3">
          <Input value={data.skills} onChange={(e) => updateData({ skills: stripEmojis(e.target.value) })} placeholder={t('resume_wizard_hint_skills')} />
          <div className="rounded-xl border border-border p-3">
            <div className="text-sm font-semibold">{t('resume_wizard_label_languages')}</div>
            <div className="mt-3 grid gap-3">
              <LanguageSelector />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLanguages.map((l, idx) => (
                <button key={`${l}-${idx}`} type="button" onClick={() => removeLanguage(idx)} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground/80">
                  {t(l.replace(/ \([A-C][12]\)$/, ''))} {l.match(/\(([A-C][12])\)/)?.[0] ?? ''}
                  <CloseCircle size={16} variant="Linear" className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PreviewCard>

      <PreviewCard title={t('resume_wizard_step_about_title')}>
        <Textarea
          value={data.about}
          onChange={(e) => updateData({ about: stripEmojis(e.target.value) })}
          placeholder={t('resume_wizard_hint_about')}
          className="min-h-[120px] rounded-2xl"
        />
      </PreviewCard>
    </div>
  );
}
