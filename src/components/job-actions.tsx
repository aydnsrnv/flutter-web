'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { createClient } from '@/lib/supabase/browser';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';

const FlashIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.09 13.28h3.09v7.2c0 1.68.91 2.02 2.02.76l7.57-8.6c.93-1.05.54-1.92-.87-1.92h-3.09v-7.2c0-1.68-.91-2.02-2.02-.76l-7.57 8.6c-.93 1.05-.54 1.92.87 1.92Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 2H9C4 2 2 4 2 9v6c0 5 2 7 7 7h6c5 0 7-2 7-7v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.04 3.02 8.16 10.9c-.3.3-.6.89-.66 1.32l-.43 3.01c-.16 1.09.61 1.85 1.7 1.7l3.01-.43c.42-.06 1.01-.36 1.32-.66l7.88-7.88c1.36-1.36 2-2.94 0-4.94-2-2-3.58-1.36-4.94 0Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.91 4.15a7.144 7.144 0 0 0 4.94 4.94" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 5.98c-3.33-.33-6.68-.5-10.02-.5-1.98 0-3.96.1-5.94.3L3 5.98M8.5 4.97l.22-1.31C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3M18.85 9.14l-.65 10.07C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14M10.33 16.5h3.33M9.5 12.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RepeatIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14.55 21.67C18.84 20.54 22 16.64 22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.64 3.16 8.54 7.45 9.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16v6l2-2M12 22l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type JobActionsProps = {
  jobId: string;
  isActive: boolean;
  isPremium?: boolean;
  onDelete?: () => void;
};

export function JobActions({ jobId, isActive, isPremium, onDelete }: JobActionsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateMessage, setReactivateMessage] = useState<string>('');
  const [reactivateReady, setReactivateReady] = useState(false);
  const [reactivatePrice, setReactivatePrice] = useState<number>(0);
  const [reactivateDays, setReactivateDays] = useState<number>(30);

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<string>('');
  const [premiumReady, setPremiumReady] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState<number>(0);
  const [premiumDays, setPremiumDays] = useState<number>(7);

  const openPremiumDialog = useCallback(async () => {
    if (loading) return;
    if (isPremium) {
      alert(t('premium_active'));
      return;
    }

    setPremiumOpen(true);
    setPremiumReady(false);
    setPremiumPrice(0);
    setPremiumDays(7);
    setPremiumMessage(t('price_loading'));

    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_premium_job, premium_day_job')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setPremiumMessage(t('price_error'));
        return;
      }

      const pricePremium = Number((data as any)?.price_premium_job ?? 0);
      const days = Number((data as any)?.premium_day_job ?? 7);
      if (!Number.isFinite(pricePremium) || pricePremium <= 0) {
        setPremiumMessage(t('premium_price_not_found'));
        return;
      }

      const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
      setPremiumPrice(pricePremium);
      setPremiumDays(safeDays);
      setPremiumMessage(
        t('premium_confirm')
          .replace('{days}', String(safeDays))
          .replace('{price}', String(pricePremium)),
      );
      setPremiumReady(true);
    } catch {
      setPremiumMessage(t('price_error'));
    }
  }, [isPremium, loading, supabase, t]);

  const confirmPremium = useCallback(async () => {
    if (!premiumReady || premiumPrice <= 0) return;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error(t('profile_login_required'));

      const { data: jobRow, error: jErr } = await supabase
        .from('jobs')
        .select('creator_id, is_premium, premium_start, create_time')
        .eq('id', jobId)
        .maybeSingle();

      if (jErr) throw new Error(jErr.message);
      if (!jobRow) throw new Error(t('job_not_found'));

      const creatorId = String((jobRow as any)?.creator_id ?? '');
      if (!creatorId || creatorId !== uid) throw new Error(t('my_jobs_premium_error').replace('{error}', 'not_allowed'));

      if ((jobRow as any)?.is_premium) {
        throw new Error(t('premium_job_already'));
      }

      const createdIso = String((jobRow as any)?.create_time ?? '');
      const createdAt = createdIso ? new Date(createdIso) : null;
      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 25) throw new Error(t('premium_job_too_old'));
      }

      const { data: userRow, error: uErr } = await supabase.from('users').select('wallet').eq('user_id', uid).maybeSingle();
      if (uErr) throw new Error(uErr.message);
      const wallet = Number((userRow as any)?.wallet ?? 0) || 0;
      if (wallet < premiumPrice) throw new Error(t('premium_balance_not_enough'));

      const now = new Date();
      const end = new Date(now.getTime() + premiumDays * 24 * 60 * 60 * 1000);

      const { error: upJobErr } = await supabase
        .from('jobs')
        .update({
          is_premium: true,
          premium_start: now.toISOString(),
          premium_end: end.toISOString(),
        } as any)
        .eq('id', jobId)
        .eq('creator_id', uid);

      if (upJobErr) throw new Error(upJobErr.message);

      const nextWallet = wallet - premiumPrice;
      const { error: upWalletErr } = await supabase.from('users').update({ wallet: nextWallet } as any).eq('user_id', uid);
      if (upWalletErr) throw new Error(t('balance_update_failed'));

      try {
        await supabase.from('wallet_transactions').insert({
          user_id: uid,
          amount: -Math.abs(Math.round(premiumPrice)),
          source: 'make_premium',
          type: 'job',
          job_id: jobId,
          created_at: new Date().toISOString(),
        } as any);
      } catch {
        // ignore wallet tx failure
      }

      setPremiumOpen(false);
      router.refresh();
      alert(t('premium_job_success'));
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [jobId, premiumDays, premiumPrice, premiumReady, router, supabase, t]);

  const handlePremium = async () => {
    await openPremiumDialog();
  };

  const handleEdit = () => {
    router.push(`/job/add?id=${jobId}`);
  };

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const openReactivateDialog = useCallback(async () => {
    if (loading) return;
    setReactivateOpen(true);
    setReactivateReady(false);
    setReactivatePrice(0);
    setReactivateDays(30);
    setReactivateMessage(t('price_loading'));
    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_job, normal_day_job')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setReactivateMessage(t('price_error'));
        return;
      }

      const priceJob = Number((data as any)?.price_job ?? 0);
      const days = Number((data as any)?.normal_day_job ?? 30);
      if (!Number.isFinite(priceJob) || priceJob <= 0) {
        setReactivateMessage(t('price_not_found'));
        return;
      }

      setReactivatePrice(priceJob);
      setReactivateDays(Number.isFinite(days) && days > 0 ? days : 30);
      setReactivateMessage(t('share_job_confirm').replace('{price}', String(priceJob)));
      setReactivateReady(true);
    } catch {
      setReactivateMessage(t('price_error'));
    }
  }, [loading, supabase, t]);

  const handleReactivate = async () => {
    await openReactivateDialog();
  };

  const confirmReactivate = useCallback(async () => {
    if (!reactivateReady || reactivatePrice <= 0) return;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error(t('login_to_add_job'));

      const { data: userRow, error: uErr } = await supabase.from('users').select('wallet').eq('user_id', uid).maybeSingle();
      if (uErr) throw new Error(uErr.message);
      const wallet = Number((userRow as any)?.wallet ?? 0) || 0;
      if (wallet < reactivatePrice) throw new Error(t('insufficient_balance'));

      const { error: rpcErr } = await supabase.rpc('reactivate_job', {
        p_job_id: jobId,
        p_user_id: uid,
        p_days: reactivateDays,
      });
      if (rpcErr) throw new Error(rpcErr.message);

      const nextWallet = wallet - reactivatePrice;
      const { error: upErr } = await supabase.from('users').update({ wallet: nextWallet } as any).eq('user_id', uid);
      if (upErr) throw new Error(t('balance_update_failed'));

      try {
        await supabase.from('wallet_transactions').insert({
          user_id: uid,
          amount: -Math.abs(Math.round(reactivatePrice)),
          source: 'post_job',
          type: 'job',
          job_id: jobId,
          created_at: new Date().toISOString(),
        } as any);
      } catch {
        // ignore wallet tx failure
      }

      setReactivateOpen(false);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [jobId, reactivateDays, reactivatePrice, reactivateReady, router, supabase, t]);

  return (
    <div className="mt-[15px] flex items-center justify-between">
      <CustomAlertDialog
        open={deleteOpen}
        title={t('delete_job_title')}
        message={t('delete_job_confirm')}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        isDestructive
        icon={<TrashIcon size={22} className="" />}
        iconColor="rgb(239,68,68)"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteOpen(false);
          setLoading(true);
          try {
            const { data: auth } = await supabase.auth.getUser();
            const uid = auth.user?.id;
            if (!uid) throw new Error(t('profile_login_required'));

            // fetch job row to know category_id and company_id
            const { data: jobRow, error: jrErr } = await supabase
              .from('jobs')
              .select('category_id, company_id')
              .eq('id', jobId)
              .eq('creator_id', uid)
              .maybeSingle();
            if (jrErr) throw new Error(jrErr.message);

            const { error: dErr } = await supabase
              .from('jobs')
              .delete()
              .eq('id', jobId)
              .eq('creator_id', uid);
            if (dErr) throw new Error(dErr.message);

            // decrement category.job_count if applicable
            try {
              const catId = jobRow?.category_id ?? null;
              if (catId) {
                const { data: catRow, error: cErr } = await supabase
                  .from('categories')
                  .select('job_count')
                  .eq('id', catId)
                  .maybeSingle();
                if (!cErr) {
                  const current = Number((catRow as any)?.job_count ?? 0);
                  const next = Math.max(0, current - 1);
                  await supabase.from('categories').update({ job_count: next } as any).eq('id', catId);
                }
              }
            } catch {
              // ignore count update failure
            }

            // decrement company.job_count if applicable
            try {
              const compId = jobRow?.company_id ?? null;
              if (compId) {
                const { data: compRow, error: pErr } = await supabase
                  .from('companies')
                  .select('job_count')
                  .eq('id', compId)
                  .maybeSingle();
                if (!pErr) {
                  const current = Number((compRow as any)?.job_count ?? 0);
                  const next = Math.max(0, current - 1);
                  await supabase.from('companies').update({ job_count: next } as any).eq('id', compId);
                }
              }
            } catch {
              // ignore count update failure
            }

            onDelete?.();
            alert(t('notification_job_deleted'));
          } catch (e: any) {
            alert(t('my_jobs_delete_error').replace('{error}', e?.message ?? String(e)));
          } finally {
            setLoading(false);
          }
        }}
      />

      <CustomAlertDialog
        open={premiumOpen}
        title={t('premium_job_title')}
        message={premiumMessage}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        icon={<FlashIcon size={22} className="" />}
        iconColor="rgb(249, 115, 22)"
        onCancel={() => setPremiumOpen(false)}
        onConfirm={async () => {
          if (!premiumReady) return;
          await confirmPremium();
        }}
      />

      <CustomAlertDialog
        open={reactivateOpen}
        title={t('confirm')}
        message={reactivateMessage}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        icon={<RepeatIcon size={22} className="" />}
        iconColor="var(--jobly-main, #245BEB)"
        onCancel={() => setReactivateOpen(false)}
        onConfirm={async () => {
          if (!reactivateReady) return;
          await confirmReactivate();
        }}
      />

      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <button
              type="button"
              onClick={handlePremium}
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-[10px] bg-orange-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
              title={isPremium ? t('premium_active') : t('premium')}
            >
              <FlashIcon size={20} className="text-orange-500/80" />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
              title={t('edit')}
            >
              <EditIcon size={20} className="text-blue-500/80" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={loading}
            className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/12 transition-opacity hover:opacity-80 disabled:opacity-50"
            title={t('confirm')}
          >
            <RepeatIcon size={20} className="text-primary" />
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="grid h-8 w-8 place-items-center rounded-[10px] bg-red-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
          title={t('delete')}
        >
          <TrashIcon size={20} className="text-red-500/80" />
        </button>
      </div>
    </div>
  );
}
