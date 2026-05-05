import { useState, useCallback, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StepPersonalInfo } from '../components/profile/steps/StepPersonalInfo';
import { StepSchool } from '../components/profile/steps/StepSchool';
import { StepTargetRoles } from '../components/profile/steps/StepTargetRoles';
import { StepSoftSkills } from '../components/profile/steps/StepSoftSkills';
import { StepInternships } from '../components/profile/steps/StepInternships';
import { StepCVUpload } from '../components/profile/steps/StepCVUpload';
import { StepSummary } from '../components/profile/steps/StepSummary';
import { useWizardStore } from '../stores/wizard-store';
import { StepIndicator } from '../components/profile/StepIndicator';

const STEPS = [
  { id: 0, label: 'Persönliches' },
  { id: 1, label: 'Bildung' },
  { id: 2, label: 'Berufswahl' },
  { id: 3, label: 'Soft Skills' },
  { id: 4, label: 'Praktika' },
  { id: 5, label: 'CV Upload' },
  { id: 6, label: 'Zusammenfassung' },
];

// Steps that can be skipped
const SKIPABLE_STEPS = new Set([3, 4, 5]); // Soft Skills, Internships, CV Upload

export default function ProfileSetup() {
  const { currentStep, setCurrentStep, draft, nextStep, prevStep } = useWizardStore();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());

  const completed = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < currentStep; i++) {
      set.add(i);
    }
    // Mark steps as completed if they have been visited and either completed or skipped
    for (const s of completedSteps) set.add(s);
    for (const s of skippedSteps) set.add(s);
    return set;
  }, [currentStep, completedSteps, skippedSteps]);

  const canGoNext = useCallback(() => {
    // Validate required fields for current step
    if (currentStep === 0) {
      if (!draft.firstName.trim() || !draft.lastName.trim()) {
        return false;
      }
    }
    // Step 1 (School) requires schoolType
    if (currentStep === 1) {
      if (!draft.schoolType) {
        return false;
      }
    }
    // Step 2 (Target Roles) requires at least one target role
    if (currentStep === 2) {
      if (!draft.targetRoles || draft.targetRoles.length === 0) {
        return false;
      }
    }
    return true;
  }, [currentStep, draft]);

  const handleNext = () => {
    if (canGoNext()) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleSkip = (stepId: number) => {
    setSkippedSteps((prev) => new Set([...prev, stepId]));
    nextStep();
  };

  const handleStepClick = (stepId: number) => {
    // Can only navigate to completed or skipped steps, or the next step
    if (stepId <= currentStep || completed.has(stepId) || skippedSteps.has(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleSummaryComplete = () => {
    // Profile saved via StepSummary component
    // Could redirect to dashboard here
  };

  const handleSummaryStep = (step: number) => {
    setCurrentStep(step);
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepPersonalInfo
            onComplete={handleNext}
            onSkip={() => handleSkip(0)}
          />
        );
      case 1:
        return (
          <StepSchool
            onComplete={handleNext}
          />
        );
      case 2:
        return (
          <StepTargetRoles
            onComplete={handleNext}
          />
        );
      case 3:
        return (
          <StepSoftSkills
            onComplete={handleNext}
            onSkip={() => handleSkip(3)}
          />
        );
      case 4:
        return (
          <StepInternships
            onComplete={handleNext}
            onSkip={() => handleSkip(4)}
          />
        );
      case 5:
        return (
          <StepCVUpload
            onComplete={handleNext}
            onSkip={() => handleSkip(5)}
          />
        );
      case 6:
        return (
          <StepSummary
            onComplete={handleSummaryComplete}
            onStep={handleSummaryStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="t-h1 text-fg-1 mb-1">Profil einrichten</h1>
          <p className="t-body text-fg-2">Schritt {currentStep + 1} von {STEPS.length}</p>
        </div>

        {/* Step indicator */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completed}
          onStepClick={handleStepClick}
        />

        {/* Step content */}
        <div className="bp-card">{renderStep()}</div>

        {/* Navigation */}
        {!isLastStep && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="bp-btn-ghost t-body-sm disabled:opacity-30"
            >
              Zurück
            </button>
            <div className="flex gap-2">
              {canGoNext() || currentStep === 1 || currentStep === 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bp-btn-primary"
                >
                  {isFirstStep ? 'Los gehts' : 'Weiter'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="bp-btn-primary opacity-50 cursor-not-allowed"
                >
                  {isFirstStep ? 'Los gehts' : 'Weiter'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
