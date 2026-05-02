'use client';

import { JobWizardProvider, useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { WizardShell } from '@/components/wizard-shell';
import { StepCompany } from '@/components/job-wizard/steps/step-company';
import { StepCategory } from '@/components/job-wizard/steps/step-category';
import { StepCity } from '@/components/job-wizard/steps/step-city';
import { StepSalary } from '@/components/job-wizard/steps/step-salary';
import { StepCriteria } from '@/components/job-wizard/steps/step-criteria';
import { StepContact } from '@/components/job-wizard/steps/step-contact';
import { StepJobInfo } from '@/components/job-wizard/steps/step-job-info';
import { StepPreview } from '@/components/job-wizard/steps/step-preview';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';
import { PageShimmer } from '@/components/page-shimmer';
import { useI18n } from '@/lib/i18n/client';

const mainColor = 'var(--jobly-main)';

function JobAddContent() {
  const { t } = useI18n();
  const {
    step,
    totalSteps,
    stepTitle,
    loading,
    saving,
    error,
    isEditMode,
    canGoNext,
    nextStep,
    prevStep,
    submit,
    saveDraft,
    confirmOpen,
    confirmMessage,
    confirmReady,
    setConfirmOpen,
  } = useJobWizard();

  if (loading) {
    return <PageShimmer />;
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <StepCompany />;
      case 2: return <StepCategory />;
      case 3: return <StepCity />;
      case 4: return <StepSalary />;
      case 5: return <StepCriteria />;
      case 6: return <StepContact />;
      case 7: return <StepJobInfo />;
      case 8: return <StepPreview />;
      default: return <StepCompany />;
    }
  };

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
            <path d="M10 13a5 5 0 0 1 0-7l.5-.5a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 1 0 7l-.5.5a5 5 0 0 1-7-7L7 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        iconColor={mainColor}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!confirmReady) return;
          setConfirmOpen(false);
          await submit();
        }}
      />

      {error ? (
        <div className="rounded-2xl border border-border px-4 py-3 text-sm" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)' }}>
          {error}
        </div>
      ) : null}

      <WizardShell
        step={step}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
        canGoNext={canGoNext}
        canGoBack={step > 1}
        isLastStep={step === totalSteps}
        onNext={nextStep}
        onBack={prevStep}
        onSubmit={submit}
        onSaveDraft={isEditMode ? undefined : saveDraft}
        saving={saving}
      >
        {renderStep()}
      </WizardShell>
    </div>
  );
}

export default function JobAddPage() {
  return (
    <JobWizardProvider>
      <JobAddContent />
    </JobWizardProvider>
  );
}
