'use client';

import { ArrowLeft, ArrowRight } from 'iconsax-react';
import { useI18n } from '@/lib/i18n/client';
import { Button } from '@/components/ui/button';

export type WizardShellProps = {
  step: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle?: string;
  canGoNext: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
  saving?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
};

export function WizardShell({
  step,
  totalSteps,
  stepTitle,
  stepSubtitle,
  canGoNext,
  canGoBack,
  isLastStep,
  onNext,
  onBack,
  onSubmit,
  onSaveDraft,
  saving,
  submitLabel,
  children,
}: WizardShellProps) {
  const { t } = useI18n();
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary">
            {t('step_counter').replace('{current}', String(step)).replace('{total}', String(totalSteps))}
          </span>
          <span className="text-xs text-muted-foreground">{stepTitle}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {stepSubtitle ? (
          <div className="mb-4 text-sm text-muted-foreground">{stepSubtitle}</div>
        ) : null}
        {children}
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 mt-6 bg-background pb-4 pt-2">
        <div className="flex gap-3">
          {canGoBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={saving}
              className="h-12 flex-1 rounded-[var(--radius-button)] text-base font-semibold"
            >
              <ArrowLeft size={18} className="mr-2" />
              {t('back')}
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          {isLastStep ? (
            <>
              {onSaveDraft ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={saving}
                  className="h-12 flex-1 rounded-[var(--radius-button)] text-base font-semibold"
                >
                  {t('saveAsDraft')}
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={onSubmit}
                disabled={saving || !canGoNext}
                className="h-12 flex-1 rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
              >
                {saving ? '…' : (submitLabel || t('share_job'))}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canGoNext || saving}
              className="h-12 flex-1 rounded-[var(--radius-button)] text-base font-bold shadow-lg shadow-primary/20"
            >
              {t('next')}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
