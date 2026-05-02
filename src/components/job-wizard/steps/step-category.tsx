'use client';

import {
  Airplane,
  Book,
  Briefcase,
  Brush,
  Building,
  Code,
  Coffee,
  Courthouse,
  DocumentText,
  Electricity,
  Health,
  Microphone,
  Money,
  More,
  People,
  Setting2,
  Shield,
  Shop,
  TruckFast,
} from 'iconsax-react';
import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { useI18n } from '@/lib/i18n/client';

function categoryIcon(listId: number, isSelected: boolean) {
  const props = {
    size: 24,
    variant: 'Linear' as const,
    color: isSelected ? 'var(--jobly-main)' : 'var(--foreground)',
  };
  const map: Record<number, React.ReactNode> = {
    0: <Code {...props} />,
    1: <Shop {...props} />,
    2: <Money {...props} />,
    3: <Book {...props} />,
    4: <DocumentText {...props} />,
    5: <Health {...props} />,
    6: <Building {...props} />,
    7: <Coffee {...props} />,
    8: <TruckFast {...props} />,
    9: <Setting2 {...props} />,
    10: <Brush {...props} />,
    11: <Courthouse {...props} />,
    12: <Airplane {...props} />,
    13: <More {...props} />,
    14: <Electricity {...props} />,
    15: <Microphone {...props} />,
    16: <People {...props} />,
    17: <Shield {...props} />,
    18: <More {...props} />,
  };
  return map[listId] ?? <More {...props} />;
}

export function StepCategory() {
  const { t } = useI18n();
  const { data, setDataField, categories } = useJobWizard();

  return (
    <div className="grid grid-cols-1 gap-3">
      {categories.map((cat) => {
        const listId = Number.isFinite(cat.list_id) ? cat.list_id : 0;
        const key = `category${listId}`;
        const subKey = `category${listId}_subtitle`;
        const label = t(key);
        const subLabel = t(subKey);
        const isSelected = data.categoryId === String(cat.id);
        const icon = categoryIcon(listId, isSelected);

        return (
          <button
            key={String(cat.id)}
            type="button"
            onClick={() => setDataField('categoryId', String(cat.id))}
            className="flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
            style={{
              borderColor: isSelected ? 'var(--jobly-main)' : 'var(--border)',
              backgroundColor: isSelected ? 'var(--jobly-main-10)' : 'transparent',
            }}
          >
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
              style={{ color: isSelected ? 'var(--jobly-main)' : 'var(--foreground)' }}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="text-sm font-semibold"
                style={{ color: isSelected ? 'var(--jobly-main)' : 'var(--foreground)' }}
              >
                {label}
              </div>
              <div className="text-xs text-muted-foreground">{subLabel}</div>
            </div>
            {isSelected ? (
              <i className="ri-checkbox-circle-fill text-xl" style={{ color: 'var(--jobly-main)' }} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
