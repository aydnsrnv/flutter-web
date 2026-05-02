'use client';

import { useMemo } from 'react';
import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
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

export function StepPreview() {
  const { t } = useI18n();
  const { data, updateData, setDataField, categories, companies, isEditMode } = useJobWizard();

  const categoryOptions = useMemo(() => {
    return categories.map((c) => {
      const listId = Number.isFinite(c.list_id) ? c.list_id : 0;
      return { value: String(c.id), label: t(`category${listId}`) };
    });
  }, [categories, t]);

  const companyOptions = useMemo(() => {
    return companies.map((c) => ({
      value: String(c.id),
      label: c.company_name,
      image: c.company_logo ?? null,
    }));
  }, [companies]);

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

  const jobTypeKeys = useMemo(() => ['job_type_full_time', 'job_type_part_time', 'job_type_intern'], []);
  const educationKeys = useMemo(() => ['education_higher', 'education_incomplete_higher', 'education_secondary_special'], []);
  const experienceKeys = useMemo(() => ['exp_none', 'exp_less_than_one', 'exp_one_to_three', 'exp_three_to_five', 'exp_more_than_five'], []);
  const genderKeys = useMemo(() => ['male', 'female', 'all_genders'], []);

  return (
    <div className="flex flex-col gap-4">
      <PreviewCard title={t('job_description')}>
        <div className="grid gap-3">
          <Input
            value={data.title}
            onChange={(e) => updateData({ title: stripEmojis(e.target.value) })}
            placeholder={t('enter_title')}
            disabled={isEditMode}
          />
          <SingleSelectDropdown
            value={data.categoryId}
            onChange={(v) => setDataField('categoryId', v)}
            placeholder={t('select_category')}
            options={categoryOptions}
          />
          <SingleSelectDropdown
            value={data.companyId}
            onChange={(v) => setDataField('companyId', v)}
            placeholder={t('select_company')}
            searchPlaceholder={t('search_title')}
            options={companyOptions}
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('salary_info')}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={data.minSalary}
            onChange={(e) => updateData({ minSalary: stripEmojis(e.target.value).replace(/-/g, '').replace(/[^0-9]/g, '') })}
            placeholder={t('min_salary')}
            inputMode="numeric"
          />
          <Input
            value={data.maxSalary}
            onChange={(e) => updateData({ maxSalary: stripEmojis(e.target.value).replace(/-/g, '').replace(/[^0-9]/g, '') })}
            placeholder={t('max_salary')}
            inputMode="numeric"
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('location_and_type')}>
        <div className="grid gap-3">
          <SingleSelectDropdown
            value={data.cityKey}
            onChange={(v) => setDataField('cityKey', v)}
            placeholder={t('select_city')}
            searchPlaceholder={t('resume_wizard_hint_search_city')}
            options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
          />
          <SingleSelectDropdown
            value={data.jobTypeKey}
            onChange={(v) => setDataField('jobTypeKey', v)}
            placeholder={t('select_job_type')}
            options={jobTypeKeys.map((k) => ({ value: k, label: t(k) }))}
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('qualification')}>
        <div className="grid gap-3">
          <SingleSelectDropdown
            value={data.educationKey}
            onChange={(v) => setDataField('educationKey', v)}
            placeholder={t('select_education')}
            options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
          />
          <SingleSelectDropdown
            value={data.experienceKey}
            onChange={(v) => setDataField('experienceKey', v)}
            placeholder={t('select_experience')}
            options={experienceKeys.map((k) => ({ value: k, label: t(k) }))}
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('candidate_criteria')}>
        <div className="grid gap-3">
          <SingleSelectDropdown
            value={data.genderKey}
            onChange={(v) => setDataField('genderKey', v)}
            placeholder={t('gender')}
            options={genderKeys.map((k) => ({ value: k, label: t(k) }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={data.minAge}
              onChange={(e) => updateData({ minAge: stripEmojis(e.target.value).replace(/-/g, '').replace(/[^0-9]/g, '') })}
              placeholder={t('min_age')}
              inputMode="numeric"
            />
            <Input
              value={data.maxAge}
              onChange={(e) => updateData({ maxAge: stripEmojis(e.target.value).replace(/-/g, '').replace(/[^0-9]/g, '') })}
              placeholder={t('max_age')}
              inputMode="numeric"
            />
          </div>
        </div>
      </PreviewCard>

      <PreviewCard title={t('contact_information')}>
        <div className="grid gap-3">
          <Input
            value={data.mail}
            onChange={(e) => updateData({ mail: stripEmojis(e.target.value) })}
            placeholder={t('email')}
          />
          <Input
            value={data.number}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, '');
              if (!raw.startsWith('0')) raw = '0' + raw;
              if (raw.length > 10) raw = raw.slice(0, 10);
              updateData({ number: raw });
            }}
            placeholder={t('phone')}
            inputMode="numeric"
            maxLength={10}
          />
          <Input
            value={data.applyLink}
            onChange={(e) => updateData({ applyLink: stripEmojis(e.target.value) })}
            placeholder={t('apply_link')}
          />
        </div>
      </PreviewCard>

      <PreviewCard title={t('request')}>
        <Textarea
          value={data.request}
          onChange={(e) => updateData({ request: stripEmojis(e.target.value) })}
          placeholder={t('enter_request')}
          className="min-h-[120px] rounded-2xl"
        />
      </PreviewCard>

      <PreviewCard title={t('about')}>
        <Textarea
          value={data.about}
          onChange={(e) => updateData({ about: stripEmojis(e.target.value) })}
          placeholder={t('enter_about')}
          className="min-h-[120px] rounded-2xl"
        />
      </PreviewCard>
    </div>
  );
}
