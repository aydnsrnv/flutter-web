'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';

const STORAGE_KEY = 'jobly_job_wizard_draft';

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
    if (error) throw new Error(error.message);
    if (!data) return n;
  }
  throw new Error(t('job_add_error_generate_number_failed'));
}

export type CategoryRow = { id: string | number; list_id: number; category_name?: string | null };
export type CompanyRow = { id: string | number; company_name: string; company_logo?: string | null };

export type JobWizardData = {
  categoryId: string;
  companyId: string;
  cityKey: string;
  jobTypeKey: string;
  educationKey: string;
  experienceKey: string;
  genderKey: string;
  title: string;
  minSalary: string;
  maxSalary: string;
  minAge: string;
  maxAge: string;
  mail: string;
  number: string;
  applyLink: string;
  request: string;
  about: string;
};

const DEFAULT_DATA: JobWizardData = {
  categoryId: '',
  companyId: '',
  cityKey: '',
  jobTypeKey: '',
  educationKey: '',
  experienceKey: '',
  genderKey: 'all_genders',
  title: '',
  minSalary: '',
  maxSalary: '',
  minAge: '',
  maxAge: '',
  mail: '',
  number: '0',
  applyLink: '',
  request: '',
  about: '',
};

const TOTAL_STEPS = 8;

function getStepTitle(step: number, t: (k: string) => string): string {
  switch (step) {
    case 1: return t('selectCompany');
    case 2: return t('selectCategory');
    case 3: return t('location');
    case 4: return t('salary');
    case 5: return t('candidate_criteria');
    case 6: return t('contact_information');
    case 7: return t('jobInfo');
    case 8: return t('preview');
    default: return '';
  }
}

type JobWizardContextValue = {
  // Meta
  step: number;
  totalSteps: number;
  stepTitle: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditMode: boolean;
  canGoNext: boolean;

  // Data lists
  categories: CategoryRow[];
  companies: CompanyRow[];

  // Form
  data: JobWizardData;
  updateData: (patch: Partial<JobWizardData>) => void;
  setDataField: <K extends keyof JobWizardData>(key: K, value: JobWizardData[K]) => void;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions
  submit: () => Promise<void>;
  saveDraft: () => Promise<void>;
  openConfirmDialog: () => Promise<void>;

  // Confirm dialog
  confirmOpen: boolean;
  confirmMessage: string;
  confirmReady: boolean;
  setConfirmOpen: (v: boolean) => void;
};

const JobWizardContext = createContext<JobWizardContextValue | null>(null);

export function useJobWizard() {
  const ctx = useContext(JobWizardContext);
  if (!ctx) throw new Error('useJobWizard must be used inside JobWizardProvider');
  return ctx;
}

export function JobWizardProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const editId = (searchParams.get('id') ?? '').trim();
  const draftId = (searchParams.get('draft_id') ?? '').trim();
  const isEditMode = Boolean(editId);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const [data, setData] = useState<JobWizardData>(DEFAULT_DATA);
  const [loadedEdit, setLoadedEdit] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmReady, setConfirmReady] = useState(false);

  const stepTitle = getStepTitle(step, t);

  // ── Load categories, companies, user ──
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!mounted) return;
      if (!user) {
        setAuthUserId(null);
        setLoading(false);
        return;
      }
      setAuthUserId(user.id);

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
    return () => { mounted = false; };
  }, [supabase]);

  // ── Load edit mode data ──
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
        const { data: row, error: qErr } = await supabase
          .from('jobs')
          .select('id, creator_id, title, category_id, company_id, city, job_type, education, experience, gender, min_salary, max_salary, min_age, max_age, mail, number, apply_link, request, about')
          .eq('id', editId)
          .eq('creator_id', authUserId)
          .maybeSingle();

        if (qErr) throw new Error(qErr.message);
        if (!row) throw new Error(t('job_not_found'));
        const r: any = row;

        setData({
          title: String(r.title ?? ''),
          categoryId: String(r.category_id ?? ''),
          companyId: String(r.company_id ?? ''),
          cityKey: String(r.city ?? ''),
          jobTypeKey: String(r.job_type ?? ''),
          educationKey: String(r.education ?? ''),
          experienceKey: String(r.experience ?? ''),
          genderKey: String(r.gender ?? 'all_genders'),
          minSalary: String(r.min_salary ?? ''),
          maxSalary: String(r.max_salary ?? ''),
          minAge: String(r.min_age ?? ''),
          maxAge: String(r.max_age ?? ''),
          mail: String(r.mail ?? ''),
          number: String(r.number ?? '0'),
          applyLink: String(r.apply_link ?? ''),
          request: String(r.request ?? ''),
          about: String(r.about ?? ''),
        });
        setStep(8); // skip to preview in edit mode
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedEdit(true);
      }
    })();
    return () => { mounted = false; };
  }, [authUserId, categories.length, companies.length, editId, isEditMode, loadedEdit, supabase, t]);

  // ── Load draft data ──
  useEffect(() => {
    let mounted = true;
    if (!draftId || isEditMode) {
      setLoadedDraft(true);
      return;
    }
    if (!authUserId) return;
    if (loadedDraft) return;

    (async () => {
      try {
        const { data: row, error } = await supabase
          .from('job_drafts')
          .select('*')
          .eq('id', draftId)
          .eq('creator_id', authUserId)
          .maybeSingle();

        if (error) throw new Error(error.message);
        if (!row) throw new Error(t('draft_not_found'));
        const r: any = row;

        setData({
          title: String(r.title ?? ''),
          categoryId: String(r.category_id ?? ''),
          companyId: String(r.company_id ?? ''),
          cityKey: String(r.city ?? ''),
          jobTypeKey: String(r.job_type ?? ''),
          educationKey: String(r.education ?? ''),
          experienceKey: String(r.experience ?? ''),
          genderKey: String(r.gender ?? 'all_genders'),
          minSalary: String(r.min_salary ?? ''),
          maxSalary: String(r.max_salary ?? ''),
          minAge: String(r.min_age ?? ''),
          maxAge: String(r.max_age ?? ''),
          mail: String(r.mail ?? ''),
          number: String(r.number ?? '0'),
          applyLink: String(r.apply_link ?? ''),
          request: String(r.request ?? ''),
          about: String(r.about ?? ''),
        });
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedDraft(true);
      }
    })();
    return () => { mounted = false; };
  }, [authUserId, draftId, isEditMode, loadedDraft, supabase, t]);

  // ── Restore from localStorage if no edit/draft ──
  useEffect(() => {
    if (isEditMode || draftId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore
    }
  }, [isEditMode, draftId]);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (isEditMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data, isEditMode]);

  const updateData = useCallback((patch: Partial<JobWizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const setDataField = useCallback(<K extends keyof JobWizardData>(key: K, value: JobWizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Validation ──
  const validateStep = useCallback((s: number): string | null => {
    switch (s) {
      case 1:
        if (!data.companyId) return t('company_id_missing');
        break;
      case 2:
        if (!data.categoryId) return t('category_id_missing');
        break;
      case 3:
        if (!data.cityKey) return t('select_city');
        break;
      case 4:
        // salary is optional
        break;
      case 5: {
        if (!data.minAge.trim() || !data.maxAge.trim()) return 'Yaş aralığını doldurun.';
        if (!data.genderKey) return t('select_gender');
        if (!data.educationKey) return t('select_education');
        if (!data.experienceKey) return t('select_experience');
        if (!data.jobTypeKey) return t('select_job_type');
        break;
      }
      case 6: {
        const email = data.mail.trim();
        const phone = data.number.trim();
        const link = data.applyLink.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hasEmail = !!email;
        const isEmailValid = !hasEmail || emailRe.test(email);
        if (!isEmailValid) return t('invalid_email');
        const isPhoneEmpty = !phone || phone === '0';
        const isPhoneValid = isPhoneEmpty || /^0\d{9}$/.test(phone);
        if (!isPhoneValid) return t('phone_length_invalid');
        const hasLink = !!link;
        const isLinkValid = !hasLink || (() => { try { const u = new URL(link); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } })();
        if (!isLinkValid) return t('invalidApplyLink');
        const hasAnyContact = (hasEmail && isEmailValid) || (!isPhoneEmpty && isPhoneValid) || (hasLink && isLinkValid);
        if (!hasAnyContact) return t('enterContactInfo');
        break;
      }
      case 7: {
        if (!data.title.trim()) return t('enter_title');
        if (!data.request.trim()) return t('enter_request');
        if (!data.about.trim()) return t('enter_about');
        break;
      }
      case 8:
        // preview uses full submit validation
        break;
    }
    return null;
  }, [data, t]);

  const canGoNext = useMemo(() => {
    if (step >= TOTAL_STEPS) return true; // preview always can submit (validation on click)
    return validateStep(step) === null;
  }, [step, validateStep]);

  // ── Navigation ──
  const goToStep = useCallback((s: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_STEPS, s));
    setStep(clamped);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(clamped));
    window.history.pushState({}, '', url.toString());
  }, []);

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS) goToStep(step + 1);
  }, [step, goToStep]);

  const prevStep = useCallback(() => {
    if (step > 1) goToStep(step - 1);
  }, [step, goToStep]);

  // Sync URL on mount
  useEffect(() => {
    const urlStep = Number(searchParams.get('step'));
    if (Number.isFinite(urlStep) && urlStep >= 1 && urlStep <= TOTAL_STEPS) {
      setStep(urlStep);
    }
  }, [searchParams]);

  // ── Submit implementation ──
  const submitImpl = useCallback(async () => {
    setError(null);
    const v = validateStep(7) || validateStep(6) || validateStep(5) || validateStep(3) || validateStep(2) || validateStep(1);
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
      const cat = categories.find((c) => String(c.id) === data.categoryId) ?? null;
      const comp = companies.find((c) => String(c.id) === data.companyId) ?? null;
      const listId = cat ? (Number.isFinite(cat.list_id) ? cat.list_id : 0) : 0;
      const categoryKey = `category${listId}`;

      const payload: Record<string, any> = {
        job_number: generatedJobNumber,
        title: data.title.trim(),
        category_name: categoryKey,
        category_id: data.categoryId,
        min_salary: data.minSalary.trim() ? data.minSalary.trim() : null,
        max_salary: data.maxSalary.trim() ? data.maxSalary.trim() : null,
        city: data.cityKey,
        job_type: data.jobTypeKey,
        min_age: data.minAge.trim() ? data.minAge.trim() : null,
        max_age: data.maxAge.trim() ? data.maxAge.trim() : null,
        experience: data.experienceKey,
        education: data.educationKey,
        gender: data.genderKey,
        mail: data.mail.trim() ? data.mail.trim() : null,
        number: data.number.trim() ? data.number.trim() : '0',
        apply_link: data.applyLink.trim() ? data.applyLink.trim() : null,
        request: data.request.trim(),
        about: data.about.trim(),
        company_name: comp?.company_name ?? '',
        company_id: data.companyId,
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
        const { data: rpcData, error: rpcErr } = await supabase.rpc('create_job', {
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
        const createdId = rpcData?.toString();
        if (!createdId) throw new Error(t('job_create_failed'));

        const { data: createdRow, error: verifyErr } = await supabase
          .from('jobs')
          .select('id, job_number')
          .eq('id', createdId)
          .maybeSingle();

        if (verifyErr) throw new Error(`${t('job_create_failed')}: ${verifyErr.message}`);
        if (!createdRow) throw new Error(t('job_create_failed'));

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
          if (patchErr) throw new Error(`${t('job_create_failed')}: ${patchErr.message}`);
          createdJobNumber = (patched as any)?.job_number ?? createdJobNumber;
          parsedJobNumber = Number(createdJobNumber);
        }

        if (Number.isFinite(parsedJobNumber) && parsedJobNumber > 0) {
          // increment counts
          try {
            if (data.categoryId) {
              const { data: catRow, error: cErr } = await supabase.from('categories').select('job_count').eq('id', data.categoryId).maybeSingle();
              if (!cErr) {
                const current = Number((catRow as any)?.job_count ?? 0);
                await supabase.from('categories').update({ job_count: current + 1 } as any).eq('id', data.categoryId);
              }
            }
          } catch { /* ignore */ }
          try {
            if (data.companyId) {
              const { data: compRow, error: pErr } = await supabase.from('companies').select('job_count').eq('id', data.companyId).maybeSingle();
              if (!pErr) {
                const current = Number((compRow as any)?.job_count ?? 0);
                await supabase.from('companies').update({ job_count: current + 1 } as any).eq('id', data.companyId);
              }
            }
          } catch { /* ignore */ }

          // clear draft storage
          localStorage.removeItem(STORAGE_KEY);
          // delete source draft if exists
          if (draftId) {
            await supabase.from('job_drafts').delete().eq('id', draftId).eq('creator_id', authUserId);
          }

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
  }, [data, authUserId, categories, companies, editId, isEditMode, draftId, router, supabase, t, validateStep]);

  const openConfirmDialog = useCallback(async () => {
    if (saving) return;
    setConfirmOpen(true);
    setConfirmReady(false);
    setConfirmMessage(t('price_loading'));
    try {
      const { data: priceRow, error: priceErr } = await supabase
        .from('price')
        .select('price_job')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (priceErr) {
        setConfirmMessage(t('price_error'));
        return;
      }
      const priceJob = Number((priceRow as any)?.price_job);
      const priceText = Number.isFinite(priceJob) && priceJob >= 0 ? String(priceJob) : t('dash_placeholder');
      setConfirmMessage(t('share_job_confirm').replace('{price}', priceText));
      setConfirmReady(true);
    } catch {
      setConfirmMessage(t('price_error'));
    }
  }, [saving, supabase, t]);

  const submit = useCallback(async () => {
    if (isEditMode) {
      await submitImpl();
      return;
    }
    await openConfirmDialog();
  }, [isEditMode, openConfirmDialog, submitImpl]);

  const saveDraft = useCallback(async () => {
    if (!authUserId) {
      setError(t('login_to_add_job'));
      return;
    }
    setSaving(true);
    try {
      // Check max 3 drafts
      const { count, error: countErr } = await supabase
        .from('job_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', authUserId);
      if (countErr) throw new Error(countErr.message);
      if ((count ?? 0) >= 3 && !draftId) {
        throw new Error(t('draft_limit_reached').replace('{max}', '3'));
      }

      const payload: Record<string, any> = {
        creator_id: authUserId,
        title: data.title.trim() || t('unTitled'),
        category_id: data.categoryId || null,
        company_id: data.companyId || null,
        city: data.cityKey || null,
        job_type: data.jobTypeKey || null,
        education: data.educationKey || null,
        experience: data.experienceKey || null,
        gender: data.genderKey || null,
        min_salary: data.minSalary.trim() || null,
        max_salary: data.maxSalary.trim() || null,
        min_age: data.minAge.trim() || null,
        max_age: data.maxAge.trim() || null,
        mail: data.mail.trim() || null,
        number: data.number.trim() || '0',
        apply_link: data.applyLink.trim() || null,
        request: data.request.trim() || null,
        about: data.about.trim() || null,
      };

      if (draftId) {
        const { error: upErr } = await supabase.from('job_drafts').update(payload).eq('id', draftId).eq('creator_id', authUserId);
        if (upErr) throw new Error(upErr.message);
      } else {
        const { error: inErr } = await supabase.from('job_drafts').insert(payload);
        if (inErr) throw new Error(inErr.message);
      }

      // clear localStorage since it's now saved to db
      localStorage.removeItem(STORAGE_KEY);
      router.push('/my/drafts');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [authUserId, data, draftId, router, supabase, t]);

  const value: JobWizardContextValue = {
    step,
    totalSteps: TOTAL_STEPS,
    stepTitle,
    loading,
    saving,
    error,
    isEditMode,
    canGoNext,
    categories,
    companies,
    data,
    updateData,
    setDataField,
    goToStep,
    nextStep,
    prevStep,
    submit,
    saveDraft,
    openConfirmDialog,
    confirmOpen,
    confirmMessage,
    confirmReady,
    setConfirmOpen,
  };

  return (
    <JobWizardContext.Provider value={value}>
      {children}
    </JobWizardContext.Provider>
  );
}
