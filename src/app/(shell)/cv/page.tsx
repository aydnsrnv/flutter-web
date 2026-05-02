'use client';

import { CvWizardProvider, useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { WizardShell } from '@/components/wizard-shell';
import { StepBasic } from '@/components/cv-wizard/steps/step-basic';
import { StepDemographics } from '@/components/cv-wizard/steps/step-demographics';
import { StepContact } from '@/components/cv-wizard/steps/step-contact';
import { StepEducation } from '@/components/cv-wizard/steps/step-education';
import { StepExperience } from '@/components/cv-wizard/steps/step-experience';
import { StepCertifications } from '@/components/cv-wizard/steps/step-certifications';
import { StepSkills } from '@/components/cv-wizard/steps/step-skills';
import { StepAbout } from '@/components/cv-wizard/steps/step-about';
import { StepPreview } from '@/components/cv-wizard/steps/step-preview';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';
import { PageShimmer } from '@/components/page-shimmer';
import { useI18n } from '@/lib/i18n/client';

function CvWizardContent() {
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
  } = useCvWizard();

  if (loading) {
    return <PageShimmer />;
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <StepBasic />;
      case 2: return <StepDemographics />;
      case 3: return <StepContact />;
      case 4: return <StepEducation />;
      case 5: return <StepExperience />;
      case 6: return <StepCertifications />;
      case 7: return <StepSkills />;
      case 8: return <StepAbout />;
      case 9: return <StepPreview />;
      default: return <StepBasic />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <CustomAlertDialog
        open={confirmOpen}
        title={t('resume_wizard_submit_title')}
        message={confirmMessage}
        confirmText={t('resume_wizard_submit_confirm')}
        cancelText={t('resume_wizard_submit_cancel')}
        icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path d="M14.55 21.67C18.84 20.54 22 16.64 22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.64 3.16 8.54 7.45 9.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16v6l2-2M12 22l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        iconColor="var(--jobly-main)"
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
        submitLabel={t('resume_wizard_submit')}
      >
        {renderStep()}
      </WizardShell>
    </div>
  );
}

export default function ResumeWizardPage() {
  return (
    <CvWizardProvider>
      <CvWizardContent />
    </CvWizardProvider>
  );
}
