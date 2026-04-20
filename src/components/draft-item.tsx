'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useI18n } from '@/lib/i18n/client';

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

const MapIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 13.43a3.12 3.12 0 1 0 0-6.24 3.12 3.12 0 0 0 0 6.24Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3.62 8.49c1.97-8.66 14.8-8.65 16.76.01 1.15 5.08-2.01 9.38-4.78 12.04a5.193 5.193 0 0 1-7.21 0c-2.76-2.66-5.92-6.97-4.77-12.05Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const DocumentIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 4.5v2c0 1.1.9 2 2 2h2M8 13h4M8 17h8" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type DraftItemProps = {
  draft: {
    id: string | number;
    title?: string | null;
    city?: string | null;
    company_name?: string | null;
    company_logo?: string | null;
    min_salary?: string | null;
    max_salary?: string | null;
  };
  draftType: 'resume' | 'job';
};

function CompanyLogo({ src, alt }: { src?: string | null; alt: string }) {
  const size = 44;

  if (!src) {
    return (
      <div
        className="grid place-items-center rounded-full"
        style={{ width: size, height: size, backgroundColor: 'rgba(36, 91, 235, 0.12)' }}
      >
        <div className="text-[16px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export function DraftItem({ draft, draftType }: DraftItemProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    if (draftType === 'resume') {
      router.push(`/resume?draft_id=${draft.id}`);
    } else {
      router.push(`/job/add?draft_id=${draft.id}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deleteDraftConfirm'))) return;
    setLoading(true);
    // TODO: Implement delete logic
    console.log('Delete draft:', draft.id);
    setLoading(false);
  };

  const title = draft.title || t('unTitled');
  const city = draft.city ? t(draft.city) : t('noLocation');
  
  let salaryText = t('salaryNotSpecified');
  if (draft.min_salary || draft.max_salary) {
    salaryText = `${draft.min_salary || ''} - ${draft.max_salary || ''} ${t('currency_azn')}`;
  }

  // For resume drafts, show simplified version
  if (draftType === 'resume') {
    return (
      <div className="overflow-hidden rounded-xl bg-background p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <MapIcon size={16} className="shrink-0 text-primary" />
              <span className="text-[13px] text-muted-foreground">{city}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              title={t('edit')}
            >
              <EditIcon size={20} className="text-blue-700" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm transition-opacity hover:opacity-80 disabled:opacity-50"
              title={t('delete')}
            >
              <TrashIcon size={20} className="text-red-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For job drafts, show full version with company info
  return (
    <div className="overflow-hidden rounded-xl bg-background p-4">
      <div className="flex items-start gap-3">
        <CompanyLogo src={draft.company_logo} alt={draft.company_name || '?'} />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold text-foreground">{draft.company_name || t('unTitled')}</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">{city}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={handleEdit}
                disabled={loading}
                className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                title={t('edit')}
              >
                <EditIcon size={20} className="text-blue-700" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                title={t('delete')}
              >
                <TrashIcon size={20} className="text-red-700" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-[16px] font-bold text-foreground">{title}</h4>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-[14px] font-medium text-primary">{salaryText}</div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-1">
              <DocumentIcon size={16} className="text-orange-500" />
              <span className="text-[13px] font-semibold text-orange-500">{t('draft')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
