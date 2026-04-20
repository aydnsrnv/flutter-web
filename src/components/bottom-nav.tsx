'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

import { useI18n } from '@/lib/i18n/client';

const items = [
  {
    href: '/home',
    labelKey: 'nav_home',
    icon: { inactive: 'ri-home-smile-line', active: 'ri-home-smile-fill' },
  },
  {
    href: '/candidates',
    labelKey: 'nav_candidates',
    icon: { inactive: 'ri-user-2-line', active: 'ri-user-2-fill' },
  },
  {
    href: '/companies',
    labelKey: 'nav_companies',
    icon: { inactive: 'ri-building-line', active: 'ri-building-fill' },
  },
  {
    href: '/categories',
    labelKey: 'nav_categories',
    icon: { inactive: 'ri-briefcase-2-line', active: 'ri-briefcase-2-fill' },
  },
];

export function BottomNav({
  variant = 'mobile',
}: {
  variant?: 'mobile' | 'desktop';
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { t } = useI18n();

  const navClassName =
    variant === 'desktop'
      ? 'sticky bottom-0 z-[80] w-full'
      : 'fixed inset-x-0 bottom-0 z-[80] mx-auto w-full max-w-md';

  return (
    <nav className={navClassName} data-bottom-nav>
      <div className="shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="overflow-hidden rounded-t-2xl">
          <div className="grid grid-cols-4 bg-background dark:bg-card">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const iconClass = active ? it.icon.active : it.icon.inactive;
          return (
            <Link
              key={it.href}
              href={it.href}
              prefetch
              onClick={(e) => {
                e.preventDefault();
                startTransition(() => {
                  router.push(it.href);
                  setTimeout(() => router.refresh(), 0);
                });
              }}
              className={cn('flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs')}
            >
              <span
                className={cn('inline-flex rounded-2xl px-[18px] py-[2px]')}
                style={
                  active
                    ? { backgroundColor: 'rgba(36, 91, 235, 0.10)' }
                    : { backgroundColor: 'transparent' }
                }
              >
                <i
                  className={cn(
                    iconClass,
                    'text-[27px] leading-none',
                    active
                      ? ''
                      : 'text-[rgba(0,0,0,0.54)] dark:text-[rgba(255,255,255,0.70)]',
                  )}
                  style={active ? { color: '#245BEB' } : undefined}
                />
              </span>
              <span
                className={cn(
                  'leading-none text-[12px]',
                  active
                    ? 'font-bold'
                    : 'font-medium text-[rgba(0,0,0,0.54)] dark:text-[rgba(255,255,255,0.70)]',
                )}
                style={active ? { color: '#245BEB' } : undefined}
              >
                {t(it.labelKey)}
              </span>
            </Link>
          );
        })}
          </div>
        </div>
      </div>
    </nav>
  );
}
