interface StepIndicatorProps {
  steps: { id: number; label: string }[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepId: number) => void;
}

export function StepIndicator({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="bp-card">
      {/* Progress bar background */}
      <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex gap-0 mt-3">
        {steps.map((s, i) => {
          const isCompleted = completedSteps.has(s.id);
          const isCurrent = currentStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onStepClick(s.id)}
              className={`
                flex-1 text-center text-t-caption transition-colors relative
                ${isCurrent ? 'text-accent font-bold' : ''}
                ${isCompleted ? 'text-fg-2' : ''}
                ${!isCurrent && !isCompleted ? 'text-fg-3 hover:text-fg-2' : ''}
              `}
            >
              <span className="flex items-center justify-center gap-1">
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`
                    inline-block w-3 h-3 rounded-full border-2
                    ${isCurrent ? 'border-accent bg-accent/20' : 'border-fg-3'}
                  `} />
                )}
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
