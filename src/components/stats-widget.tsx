'use client';

import { useState } from 'react';
import { Briefcase, Calendar1, CalendarSearch, CalendarTick } from 'iconsax-react';
import { useI18n } from '@/lib/i18n/client';
import type { StatsData } from '@/app/actions/stats';

type Tab = 'jobs' | 'resumes';

type CardProps = {
  label: string;
  value: number;
  gradient: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, gradient, icon }: CardProps) {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-4"
      style={{ background: gradient, minHeight: 100 }}
    >
      <div className="flex items-center gap-2">
        <span className="opacity-90">{icon}</span>
        <span className="text-[12px] font-semibold leading-tight text-white/90">{label}</span>
      </div>
      <div
        className="mt-3 text-[26px] font-bold text-white"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      >
        {value}
      </div>
    </div>
  );
}

export function StatsWidget({ data }: { data: StatsData }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('jobs');

  const current = data[tab];

  const cards: CardProps[] = [
    {
      label: t('active'),
      value: current.total,
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      icon: <Briefcase size={18} color="white" variant="Bold" />,
    },
    {
      label: t('today'),
      value: current.today,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      icon: <Calendar1 size={18} color="white" variant="Bold" />,
    },
    {
      label: t('thisWeek'),
      value: current.thisWeek,
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      icon: <CalendarTick size={18} color="white" variant="Bold" />,
    },
    {
      label: t('thisMonth'),
      value: current.thisMonth,
      gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      icon: <CalendarSearch size={18} color="white" variant="Bold" />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <span className="text-[16px] font-bold">{t('statistics')}</span>
      </div>

      {/* Tabs */}
      <div className="mx-4 mb-3 flex gap-0 rounded-full border border-border bg-card p-1">
        {(['jobs', 'resumes'] as Tab[]).map((tabKey) => {
          const active = tab === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              className={`flex-1 rounded-full py-[7px] text-[12px] transition-all duration-200 ${active ? 'bg-primary/12 font-bold text-primary' : 'font-semibold text-foreground'}`}
              onClick={() => setTab(tabKey)}
            >
              {tabKey === 'jobs' ? t('menuTabVacancies') : t('menuTabCvs')}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

