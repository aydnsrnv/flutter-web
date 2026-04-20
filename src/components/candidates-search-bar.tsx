'use client';

import Link from 'next/link';
import { SearchNormal1, Setting3 } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';

export function CandidatesSearchBar({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        const next = q.trim();
        router.push(next ? `/candidates?q=${encodeURIComponent(next)}` : '/candidates');
      }}
    >
      <Input
        style={{ paddingLeft: 55, paddingRight: 58 }}
        placeholder={t('search_cv_placeholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <SearchNormal1 size={21} variant="Linear" color="#6B7280" />
      </div>

      <Link
        href="/resume-filters"
        aria-label={t('aria_filters')}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        prefetch
      >
        <div className="grid h-9 w-9 place-items-center rounded-[14px]" style={{ backgroundColor: '#245BEB' }}>
          <Setting3 size={21} variant="Linear" color="#FFFFFF" />
        </div>
      </Link>
    </form>
  );
}
