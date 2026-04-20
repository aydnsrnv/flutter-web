'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowDown2, Call, Sms } from 'iconsax-react';

import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';
import { PageShimmer } from '@/components/page-shimmer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const mainColor = '#245BEB';

async function generateUniqueJobNumber(
  supabase: ReturnType<typeof createClient>,
  t: (key: string) => string,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const n = 100000 + Math.floor(Math.random() * 900000);
    const { data, error } = await supabase
      .from('jobs')
      .select('job_number')
      .eq('job_number', n)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return n;
    }
  }

  throw new Error(t('job_add_error_generate_number_failed'));
}

type CategoryRow = {
  id: string | number;
  list_id: number;
  category_name?: string | null;
};

type CompanyRow = {
  id: string | number;
  company_name: string;
  company_logo?: string | null;
};

function stripEmojis(input: string) {
  try {
    return input
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function sanitizeNonNegativeNumberString(input: string) {
  const noEmoji = stripEmojis(input);
  const cleaned = noEmoji.replace(/-/g, '').replace(/[^0-9]/g, '');
  return cleaned;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  const resolvedValue = stripEmojis(value);
  return (
    <Input
      value={resolvedValue}
      onChange={(e) => {
        const raw = e.target.value;
        const next = type === 'number' ? sanitizeNonNegativeNumberString(raw) : stripEmojis(raw);
        onChange(next);
      }}
      onKeyDown={(e) => {
        if (type !== 'number') return;
        if (e.key === '-') e.preventDefault();
      }}
      placeholder={placeholder}
      type={type ?? 'text'}
      min={type === 'number' ? 0 : undefined}
    />
  );
}



function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-1 text-[16px] font-bold text-foreground">
      {title}
    </div>
  );
}

export default function JobAddPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const editId = (searchParams.get('id') ?? '').trim();
  const isEditMode = Boolean(editId);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const [categoryId, setCategoryId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const [cityKey, setCityKey] = useState('');
  const [jobTypeKey, setJobTypeKey] = useState('');
  const [educationKey, setEducationKey] = useState('');
  const [experienceKey, setExperienceKey] = useState('');
  const [genderKey, setGenderKey] = useState('all_genders');

  const [title, setTitle] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const [mail, setMail] = useState('');
  const [number, setNumber] = useState('0');
  const [applyLink, setApplyLink] = useState('');

  const [request, setRequest] = useState('');
  const [about, setAbout] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [confirmReady, setConfirmReady] = useState(false);

  const [loadedEdit, setLoadedEdit] = useState(false);

  const cityKeys = useMemo(
    () => [
      'city_baku',
      'city_absheron',
      'city_ganja',
      'city_sumgait',
      'city_mingechevir',
      'city_khankendi',
      'city_lenkeran',
      'city_sheki',
      'city_shirvan',
      'city_nakhchivan',
      'city_quba',
      'city_qusar',
      'city_qabala',
      'city_zaqatala',
      'city_shamakhi',
      'city_tovuz',
      'city_agdam',
      'city_fuzuli',
      'city_shamkir',
      'city_barda',
      'city_masalli',
      'city_salyan',
      'city_astara',
      'city_yevlakh',
      'city_qazakh',
      'city_gadabay',
      'city_sabirabad',
      'city_zardab',
      'city_imishli',
      'city_balakan',
      'city_saatli',
      'city_ujar',
      'city_beylagan',
      'city_agjabadi',
      'city_agdash',
      'city_hajigabul',
      'city_gobustan',
      'city_qakh',
      'city_samukh',
      'city_tartar',
      'city_khizi',
      'city_goychay',
      'city_kurdamir',
      'city_siazan',
      'city_aghstafa',
      'city_neftchala',
      'city_shabran',
      'city_lerik',
      'city_yardimli',
      'city_jalilabad',
      'city_aghdara',
      'city_agsu',
      'city_ali_bayramli',
      'city_culfa',
      'city_dashkasan',
      'city_goygol',
      'city_goytepe',
      'city_ismayilli',
      'city_kalbajar',
      'city_lachin',
      'city_naftalan',
      'city_oguz',
      'city_ordubad',
      'city_garadag',
      'city_qubadli',
      'city_shahbuz',
      'city_sharur',
      'city_shusha',
      'city_khirdalan',
      'city_khojali',
      'city_khojavend',
      'city_khudat',
      'city_zangilan',
    ],
    [],
  );

  const jobTypeKeys = useMemo(() => ['job_type_full_time', 'job_type_part_time', 'job_type_intern'], []);
  const educationKeys = useMemo(() => ['education_higher', 'education_incomplete_higher', 'education_secondary_special'], []);
  const experienceKeys = useMemo(
    () => ['exp_none', 'exp_less_than_one', 'exp_one_to_three', 'exp_three_to_five', 'exp_more_than_five'],
    [],
  );
  const genderKeys = useMemo(() => ['male', 'female', 'all_genders'], []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      if (!user) {
        setAuthUserId(null);
        setLoading(false);
        return;
      }
      setAuthUserId(user.id);
      setMail(user.email ?? '');

      const fetchAllCompanies = async () => {
        const all: CompanyRow[] = [];
        const pageSize = 1000;

        for (let from = 0; from < 10000; from += pageSize) {
          const to = from + pageSize - 1;
          const { data: page, error } = await supabase
            .from('companies')
            .select('id, company_name, company_logo')
            .order('company_name', { ascending: true })
            .range(from, to);

          if (error) throw new Error(error.message);
          const rows = (page ?? []) as CompanyRow[];
          all.push(...rows);
          if (rows.length < pageSize) break;
        }

        return all;
      };

      const [{ data: catData }, compData] = await Promise.all([
        supabase.from('categories').select('id, list_id, category_name').order('job_count', { ascending: false }).limit(200),
        fetchAllCompanies(),
      ]);

      if (!mounted) return;
      setCategories((catData ?? []) as CategoryRow[]);
      setCompanies((compData ?? []) as CompanyRow[]);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    if (!isEditMode) {
      setLoadedEdit(true);
      return;
    }

    if (!authUserId || !categories.length || !companies.length) return;
    if (loadedEdit) return;

    (async () => {
      try {
        const { data, error: qErr } = await supabase
          .from('jobs')
          .select('id, creator_id, title, category_id, company_id, city, job_type, education, experience, gender, min_salary, max_salary, min_age, max_age, mail, number, apply_link, request, about')
          .eq('id', editId)
          .eq('creator_id', authUserId)
          .maybeSingle();

        if (qErr) throw new Error(qErr.message);
        if (!data) throw new Error(t('job_not_found'));

        const row: any = data;
        setTitle(String(row.title ?? ''));
        setCategoryId(String(row.category_id ?? ''));
        setCompanyId(String(row.company_id ?? ''));
        setCityKey(String(row.city ?? ''));
        setJobTypeKey(String(row.job_type ?? ''));
        setEducationKey(String(row.education ?? ''));
        setExperienceKey(String(row.experience ?? ''));
        setGenderKey(String(row.gender ?? 'all_genders'));

        setMinSalary(String(row.min_salary ?? ''));
        setMaxSalary(String(row.max_salary ?? ''));
        setMinAge(String(row.min_age ?? ''));
        setMaxAge(String(row.max_age ?? ''));

        setMail(String(row.mail ?? ''));
        setNumber(String(row.number ?? '0'));
        setApplyLink(String(row.apply_link ?? ''));
        setRequest(String(row.request ?? ''));
        setAbout(String(row.about ?? ''));
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedEdit(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authUserId, categories.length, companies.length, editId, isEditMode, loadedEdit, supabase, t]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => {
      const listId = Number.isFinite(c.list_id) ? c.list_id : 0;
      const key = `category${listId}`;
      const label = t(key);
      return { value: String(c.id), label };
    });
  }, [categories, t]);

  const companyOptions = useMemo(() => {
    return companies.map((c) => ({ value: String(c.id), label: c.company_name }));
  }, [companies]);

  const validate = useCallback((): string | null => {
    if (!title.trim()) return t('enter_title');
    if (!categoryId) return t('category_id_missing');
    if (!companyId) return t('company_id_missing');
    if (!cityKey) return t('select_city');
    if (!jobTypeKey) return t('select_job_type');
    if (!educationKey) return t('select_education');
    if (!experienceKey) return t('select_experience');
    if (!request.trim()) return t('enter_request');
    if (!about.trim()) return t('enter_about');

    const email = mail.trim();
    if (!email || !email.includes('@')) return t('invalid_email');

    const phone = number.trim();
    if (phone && phone !== '0') {
      if (!/^0\d{9}$/.test(phone)) return t('phone_length_invalid');
    }

    return null;
  }, [about, categoryId, cityKey, companyId, educationKey, experienceKey, jobTypeKey, mail, number, request, t, title]);

  const submitImpl = useCallback(async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!authUserId) {
      setError(t('login_to_add_job'));
      return;
    }

    setSaving(true);
    try {
      const generatedJobNumber = await generateUniqueJobNumber(supabase, t);

      const cat = categories.find((c) => String(c.id) === categoryId) ?? null;
      const comp = companies.find((c) => String(c.id) === companyId) ?? null;
      const listId = cat ? (Number.isFinite(cat.list_id) ? cat.list_id : 0) : 0;
      const categoryKey = `category${listId}`;

      const payload: Record<string, any> = {
        job_number: generatedJobNumber,
        title: title.trim(),
        category_name: categoryKey,
        category_id: categoryId,
        min_salary: minSalary.trim() ? minSalary.trim() : null,
        max_salary: maxSalary.trim() ? maxSalary.trim() : null,
        city: cityKey,
        job_type: jobTypeKey,
        min_age: minAge.trim() ? minAge.trim() : null,
        max_age: maxAge.trim() ? maxAge.trim() : null,
        experience: experienceKey,
        education: educationKey,
        gender: genderKey,
        mail: mail.trim(),
        number: number.trim() && number.trim() !== '0' ? number.trim() : null,
        apply_link: applyLink.trim() ? applyLink.trim() : null,
        request: request.trim(),
        about: about.trim(),
        company_name: comp?.company_name ?? '',
        company_id: companyId,
        company_logo: comp?.company_logo ?? '',
        creator_id: authUserId,
        status: true,
        is_premium: false,
      };

      if (isEditMode) {
        const { data: updated, error: upErr } = await supabase
          .from('jobs')
          .update({
            ...payload,
            creator_id: undefined,
            status: undefined,
            is_premium: undefined,
          })
          .eq('id', editId)
          .eq('creator_id', authUserId)
          .select('id')
          .maybeSingle();

        if (upErr) throw new Error(upErr.message);
        const updatedId = (updated as any)?.id?.toString() ?? editId;
        router.push(`/jobs/${updatedId}`);
      } else {
        const { data, error: rpcErr } = await supabase.rpc('create_job', {
          p_job: payload,
          p_days: 30,
        });

        if (rpcErr) {
          const msg = rpcErr.message ?? '';
          if (msg.toLowerCase().includes('function') && msg.toLowerCase().includes('create_job')) {
            throw new Error(`${t('job_create_failed')}: ${msg}`);
          }
          throw new Error(msg);
        }
        const createdId = data?.toString();
        if (!createdId) throw new Error(t('job_create_failed'));

        const { data: createdRow, error: verifyErr } = await supabase
          .from('jobs')
          .select('id, job_number')
          .eq('id', createdId)
          .maybeSingle();

        if (verifyErr) {
          throw new Error(`${t('job_create_failed')}: ${verifyErr.message}`);
        }
        if (!createdRow) {
          throw new Error(t('job_create_failed'));
        }

        let createdJobNumber = (createdRow as any)?.job_number;
        let parsedJobNumber = Number(createdJobNumber);
        if (!(Number.isFinite(parsedJobNumber) && parsedJobNumber > 0)) {
          const { data: patched, error: patchErr } = await supabase
            .from('jobs')
            .update({ job_number: generatedJobNumber })
            .eq('id', createdId)
            .eq('creator_id', authUserId)
            .select('job_number')
            .maybeSingle();

          if (patchErr) {
            throw new Error(`${t('job_create_failed')}: ${patchErr.message}`);
          }

          createdJobNumber = (patched as any)?.job_number ?? createdJobNumber;
          parsedJobNumber = Number(createdJobNumber);
        }

        if (Number.isFinite(parsedJobNumber) && parsedJobNumber > 0) {
          router.push(`/job/${createdJobNumber}`);
        } else {
          throw new Error(t('job_create_failed'));
        }
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [about, applyLink, authUserId, categories, categoryId, cityKey, companies, companyId, educationKey, editId, experienceKey, genderKey, isEditMode, jobTypeKey, mail, maxAge, maxSalary, minAge, minSalary, number, request, router, supabase, t, title, validate]);

  const openConfirmDialog = useCallback(async () => {
    if (saving) return;
    setConfirmOpen(true);
    setConfirmReady(false);
    setConfirmMessage(t('price_loading'));
    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_job')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setConfirmMessage(t('price_error'));
        return;
      }

      const priceJob = Number((data as any)?.price_job);
      const priceText = Number.isFinite(priceJob) && priceJob >= 0 ? String(priceJob) : t('dash_placeholder');
      setConfirmMessage(t('share_job_confirm').replace('{price}', priceText));
      setConfirmReady(true);
    } catch {
      setConfirmMessage(t('price_error'));
    }
  }, [saving, supabase, t]);

  const onSubmit = useCallback(async () => {
    if (isEditMode) {
      await submitImpl();
      return;
    }
    await openConfirmDialog();
  }, [isEditMode, openConfirmDialog, submitImpl]);

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="flex flex-col gap-4">
      <CustomAlertDialog
        open={confirmOpen}
        title={t('confirm')}
        message={confirmMessage}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path
              d="M10 13a5 5 0 0 1 0-7l.5-.5a5 5 0 0 1 7 7L17 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11a5 5 0 0 1 0 7l-.5.5a5 5 0 0 1-7-7L7 11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        iconColor={mainColor}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!confirmReady) return;
          setConfirmOpen(false);
          await submitImpl();
        }}
      />

      {error ? (
        <div className="rounded-2xl border border-border px-4 py-3 text-[14px]" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)' }}>
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('job_description')} />
          <div className="mt-4 grid gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(stripEmojis(e.target.value))}
              placeholder={t('enter_title')}
              disabled={isEditMode}
            />
            <SingleSelectDropdown
              value={categoryId}
              onChange={setCategoryId}
              placeholder={t('select_category')}
              options={categoryOptions}
            />
            <SingleSelectDropdown
              value={companyId}
              onChange={setCompanyId}
              placeholder={t('select_company')}
              searchPlaceholder={t('search_title')}
              options={companyOptions}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('salary_info')} />
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <TextInput value={minSalary} onChange={setMinSalary} placeholder={t('min_salary')} type="number" />
              <TextInput value={maxSalary} onChange={setMaxSalary} placeholder={t('max_salary')} type="number" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('location_and_type')} />
          <div className="mt-4 grid gap-3">
            <SingleSelectDropdown
              value={cityKey}
              onChange={setCityKey}
              placeholder={t('select_city')}
              searchPlaceholder={t('resume_wizard_hint_search_city')}
              options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
            />
            <SingleSelectDropdown
              value={jobTypeKey}
              onChange={setJobTypeKey}
              placeholder={t('select_job_type')}
              options={jobTypeKeys.map((k) => ({ value: k, label: t(k) }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('qualification')} />
          <div className="mt-4 grid gap-3">
            <SingleSelectDropdown
              value={educationKey}
              onChange={setEducationKey}
              placeholder={t('select_education')}
              options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
            />
            <SingleSelectDropdown
              value={experienceKey}
              onChange={setExperienceKey}
              placeholder={t('select_experience')}
              options={experienceKeys.map((k) => ({ value: k, label: t(k) }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('candidate_criteria')} />
          <div className="mt-4 grid gap-3">
            <SingleSelectDropdown
              value={genderKey}
              onChange={setGenderKey}
              placeholder={t('gender')}
              options={genderKeys.map((k) => ({ value: k, label: t(k) }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextInput value={minAge} onChange={setMinAge} placeholder={t('min_age')} type="number" />
              <TextInput value={maxAge} onChange={setMaxAge} placeholder={t('max_age')} type="number" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('contact_information')} />
          <div className="mt-4 grid gap-3">
            <div className="relative">
              <Sms size={18} variant="Linear" className="absolute left-4 top-3" color={mainColor} />
              <Input
                value={mail}
                onChange={(e) => setMail(stripEmojis(e.target.value))}
                placeholder={t('email')}
                className="pl-11 pr-4"
              />
            </div>
            <div className="relative">
              <Call size={18} variant="Linear" className="absolute left-4 top-3" color={mainColor} />
              <Input
                value={number}
                onChange={(e) => setNumber(stripEmojis(e.target.value))}
                placeholder={t('phone')}
                className="pl-11 pr-4"
              />
            </div>
            <TextInput value={applyLink} onChange={setApplyLink} placeholder={t('apply_link')} />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('request')} />
          <div className="mt-4">
            <Textarea
              value={request}
              onChange={(e) => setRequest(stripEmojis(e.target.value))}
              placeholder={t('enter_request')}
              className="min-h-[120px] rounded-2xl"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('about')} />
          <div className="mt-4">
            <Textarea
              value={about}
              onChange={(e) => setAbout(stripEmojis(e.target.value))}
              placeholder={t('enter_about')}
              className="min-h-[120px] rounded-2xl"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => void onSubmit()}
          disabled={saving}
          className="h-12 w-full rounded-2xl text-[16px] font-bold"
        >
          {saving ? `${isEditMode ? t('edit_job') : t('add_job')}…` : (isEditMode ? t('edit_job') : t('add_job'))}
        </Button>
      </div>
    </div>
  );
}
