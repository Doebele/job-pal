import { SCHULSYSTEM_CH } from '@shared/constants';
import { useWizardStore } from '../../../stores/wizard-store';

interface StepSchoolProps {
  onComplete: () => void;
}

const SCHOOL_TYPES = Object.entries(SCHULSYSTEM_CH) as [import('@shared/types').SchoolType, string][];

export function StepSchool({ onComplete }: StepSchoolProps) {
  const { draft, setDraft } = useWizardStore();

  const handleSchoolTypeChange = (schoolType: import('@shared/types').SchoolType) => {
    setDraft({ schoolType });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Schulabschluss</p>
        <p className="t-body text-fg-2 mb-4">
          Welchen Abschluss hast du gemacht? Dieser Schritt ist verpflichtend.
        </p>
      </div>

      {/* School type selector */}
      <div className="space-y-2">
        <p className="t-h3 text-fg-1">Art des Abschlusses</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCHOOL_TYPES.map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleSchoolTypeChange(type)}
              className={`
                bp-card text-left px-4 py-3 transition-all
                ${draft.schoolType === type
                  ? 'border-accent bg-surface ring-1 ring-accent/20'
                  : 'border-border hover:border-fg-3/30'}
              `}
            >
              <p className="t-body text-fg-1">{label}</p>
              <p className="t-caption text-fg-3 mt-1">{type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* School name */}
      <div>
        <label className="block mb-1">
          <span className="t-h3 text-fg-1">Schule / Lehrbetrieb</span>
          <span className="text-fg-3 ml-1">(optional)</span>
        </label>
        <input
          type="text"
          value={draft.schoolName || ''}
          onChange={(e) => setDraft({ schoolName: e.target.value || null })}
          placeholder="z.B. BMS Gesundheit Zürich"
          className="bp-input w-full"
        />
      </div>

      {/* Graduation year */}
      <div>
        <label className="block mb-1">
          <span className="t-h3 text-fg-1">Abschlussjahr</span>
          <span className="text-fg-3 ml-1">(optional)</span>
        </label>
        <input
          type="number"
          value={draft.graduationYear || ''}
          onChange={(e) => setDraft({ graduationYear: e.target.value ? parseInt(e.target.value) : null })}
          placeholder="2025"
          min={1990}
          max={2030}
          className="bp-input w-full max-w-[200px]"
        />
      </div>

      {/* Wants training */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDraft({ wantsTraining: !draft.wantsTraining })}
          className={`
            w-10 h-6 rounded-full transition-colors border
            ${draft.wantsTraining ? 'bg-accent border-accent' : 'bg-surface-2 border-border'}
          `}
        >
          <span className={`
            inline-block w-4 h-4 rounded-full bg-white transition-transform
            ${draft.wantsTraining ? 'translate-x-5' : 'translate-x-1'}
          `} />
        </button>
        <div>
          <p className="t-body text-fg-1">Ich suche eine Lehrstelle</p>
          <p className="t-caption text-fg-3">Aktiviere dies, wenn du eine Lehre suchst</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="bp-btn-primary"
      >
        Weiter
      </button>
    </div>
  );
}
