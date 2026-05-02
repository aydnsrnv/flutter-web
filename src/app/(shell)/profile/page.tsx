import Link from 'next/link';

import { cloneElement, isValidElement, type ReactElement } from 'react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

import { Add, ArrowRight2, Briefcase, Edit, Lock, LogoutCurve, Wallet2, WalletMinus, Chart2 } from 'iconsax-react';
import { ManatIcon } from '@/components/ui/manat-icon';
import { ProfileAvatarUpload } from '@/components/profile-avatar-upload';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

type UserRow = {
  user_id: string;
  email?: string | null;
  full_name?: string | null;
  profile_image?: string | null;
  wallet?: number | null;
  user_type?: string | null;
};

function formatCount(n: number) {
  if (n < 10000) return String(n);
  const isExact = n % 1000 === 0;
  const inK = n / 1000;
  const formatted = isExact ? inK.toFixed(0) : inK.toFixed(1);
  return `${formatted.replace('.', ',')}{k}`;
}

function MenuRow({
  title,
  icon,
  href,
  danger,
}: {
  title: string;
  icon: ReactElement;
  href?: string;
  danger?: boolean;
}) {
  const resolvedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<any>, { color: 'currentColor' } as any)
    : icon;
  const row = (
    <div className="flex items-center px-3 py-3">
      <div className="grid h-[60px] w-[60px] place-items-center">
        <div className={cn(
          "grid h-[60px] w-[60px] place-items-center rounded-full",
          danger ? "bg-destructive/10" : "bg-jobly-soft"
        )}>
          <span className={cn(danger ? "text-destructive" : "text-primary")}>{resolvedIcon}</span>
        </div>
      </div>
      <div className="w-4 shrink-0" />
      <div className={cn("min-w-0 flex-1 text-base font-normal", danger && "text-destructive")}>
        {title}
      </div>
      <div className="shrink-0 text-muted-foreground">
        <ArrowRight2 size={20} variant="Linear" />
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {row}
      </a>
    );
  }

  return <div className="opacity-60">{row}</div>;
}

function Separator() {
  return <div className="h-px w-full bg-border/60" />;
}

export default async function ProfilePage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  const email = user?.email ?? null;

  let userRow: UserRow | null = null;
  let userError: string | null = null;

  if (uid) {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, profile_image, wallet, user_type')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) userError = error.message;
    userRow = (data as UserRow | null) ?? null;
  }

  const fullName = (userRow?.full_name ?? '').trim() || t('user');
  const avatar = (userRow?.profile_image ?? '').trim() || null;
  const wallet = userRow?.wallet ?? 0;
  const userType = (userRow?.user_type ?? '').toLowerCase();
  const isCandidate = userType === 'candidate';



  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 text-sm font-bold bg-primary/10 text-foreground">
            <WalletMinus size={16} variant="Outline" color="currentColor" className="mr-1" />
            <span>{wallet}</span>
            <ManatIcon size={16} color="currentColor" className="text-primary" />
          </div>

          <Link
            href="/wallet"
            className="grid h-10 w-10 place-items-center rounded-xl bg-jobly-soft"
            aria-label={t('wallet_add_balance')}
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary">
              <Add size={18} variant="Linear" color="currentColor" className="text-primary-foreground" />
            </div>
          </Link>
        </div>
      </header>

      {userError ? (
        <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
          {t('profile_load_error').replace('{error}', userError)}
        </div>
      ) : null}

      <div className="w-full overflow-hidden rounded-b-3xl rounded-t-2xl border border-border bg-card shadow-sm">
        <div className="px-4 pb-5 pt-5">
          <div className="flex flex-col items-center">
            <ProfileAvatarUpload
              avatarUrl={avatar}
              fullName={fullName || ''}
              isCandidate={isCandidate}
              userId={user?.id || ''}
              editable={false}
            />

            <div className="mt-3 text-center">
              <div className="text-xl font-bold text-foreground">
                {fullName}
              </div>
              <div className="mt-1 text-base text-muted-foreground">
                {userRow?.email ?? email ?? ''}
              </div>
            </div>

            {isCandidate ? (
              <div className="mt-4 w-full">
                <Link
                  href="/create/cv/add"
                  className="block h-12 w-full rounded-xl text-center text-base font-semibold leading-[48px] text-white bg-gradient-to-r from-primary via-emerald-500 to-purple-500 shadow-lg shadow-primary/20"
                >
                  {t('profile_create_cv')}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-0">
        <div className="px-2 pb-1">
          <div className="px-2 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            {t('account_section')}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <MenuRow
            title={isCandidate ? t('profile_my_cvs') : t('menu_my_jobs')}
            icon={<Briefcase size={34} variant="Linear" />}
            href={isCandidate ? '/my/cvs' : '/my/jobs'}
          />
          <Separator />
          {!isCandidate && (
            <>
              <MenuRow
                title={t('statistics') || 'Statistikalar'}
                icon={<Chart2 size={34} variant="Linear" />}
                href="/my/stats"
              />
              <Separator />
            </>
          )}
          <MenuRow
            title={t('drafts')}
            icon={<Edit size={34} variant="Linear" />}
            href="/my/drafts"
          />
          <Separator />
          <MenuRow
            title={t('menu_payments_history')}
            icon={<Wallet2 size={34} variant="Linear" />}
            href="/payments-history"
          />
          <Separator />
          <MenuRow
            title={t('spendings_title')}
            icon={<WalletMinus size={34} variant="Linear" />}
            href="/wallet-transactions"
          />
        </div>

        <div className="mt-3 px-2 pb-1">
          <div className="px-2 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            {t('other_section')}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <MenuRow
            title={t('menu_change_password')}
            icon={<Lock size={34} variant="Linear" />}
            href="/change-password"
          />
          <Separator />
          <MenuRow
            title={t('logout')}
            icon={<LogoutCurve size={34} variant="Linear" />}
            href="/logout"
            danger
          />
        </div>
      </div>
    </div>
  );
}
