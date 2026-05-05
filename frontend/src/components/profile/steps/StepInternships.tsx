import { useWizardStore } from '../../../stores/wizard-store';

interface StepInternshipsProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StepInternships({ onComplete, onSkip }: StepInternshipsProps) {
  const { draft, setDraft } = useWizardStore();

  const addInternship = () => {
    const newInternship: import('@shared/types').Internship = {
      company: '',
      role: '',
      durationMonths: 0,
      description: '',
      skillsUsed: [],
    };
    setDraft({ internships: [...draft.internships, newInternship] });
  };

  const updateInternship = (
    index: number,
    field: keyof import('@shared/types').Internship,
    value: string | number | string[]
  ) => {
    const newInternships = [...draft.internships];
    newInternships[index] = { ...newInternships[index], [field]: value };
    setDraft({ internships: newInternships });
  };

  const removeInternship = (index: number) => {
    setDraft({ internships: draft.internships.filter((_, i) => i !== index) });
  };

  const toggleSkill = (index: number, skill: string) => {
    const newInternships = [...draft.internships];
    const skills = newInternships[index].skillsUsed || [];
    const newSkills = skills.includes(skill)
      ? skills.filter((s) => s !== skill)
      : [...skills, skill];
    newInternships[index] = { ...newInternships[index], skillsUsed: newSkills };
    setDraft({ internships: newInternships });
  };

  const COMMON_SKILLS = [
    'Teamarbeit', 'Kommunikation', 'Problemloesung', 'Organisation',
    'Kundenkontakt', 'Excel', 'PowerPoint', 'Word', 'Photoshop',
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Praktika</p>
        <p className="t-body text-fg-2 mb-4">
          Hast du Praktika oder Einsätze gemacht? Füge sie hier hinzu.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="t-h3 text-fg-1">Praktika & Einsätze</p>
        <button
          type="button"
          onClick={addInternship}
          className="t-body-sm text-accent hover:text-accent/80"
        >
          + Hinzufügen
        </button>
      </div>

      {draft.internships.length === 0 && (
        <div className="bp-card text-center py-8 border-dashed">
          <p className="t-body text-fg-3">Noch keine Praktika eingetragen</p>
          <button
            type="button"
            onClick={addInternship}
            className="t-body-sm text-accent mt-2"
          >
            Erstes Praktikum hinzufügen
          </button>
        </div>
      )}

      {draft.internships.map((internship, i) => (
        <div key={i} className="bp-card space-y-3 relative">
          <button
            type="button"
            onClick={() => removeInternship(i)}
            className="absolute top-3 right-3 text-fg-3 hover:text-fg-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div>
            <label className="block mb-1">
              <span className="t-body-sm text-fg-3">Firma</span>
            </label>
            <input
              type="text"
              value={internship.company}
              onChange={(e) => updateInternship(i, 'company', e.target.value)}
              placeholder="z.B. Firma XYZ AG"
              className="bp-input w-full"
            />
          </div>

          <div>
            <label className="block mb-1">
              <span className="t-body-sm text-fg-3">Tätigkeit</span>
            </label>
            <input
              type="text"
              value={internship.role}
              onChange={(e) => updateInternship(i, 'role', e.target.value)}
              placeholder="z.B. Support-Assistent"
              className="bp-input w-full"
            />
          </div>

          <div>
            <label className="block mb-1">
              <span className="t-body-sm text-fg-3">Dauer (Monate)</span>
            </label>
            <input
              type="number"
              value={internship.durationMonths || ''}
              onChange={(e) => updateInternship(i, 'durationMonths', parseInt(e.target.value) || 0)}
              placeholder="3"
              min={0}
              max={24}
              className="bp-input w-full max-w-[200px]"
            />
          </div>

          <div>
            <label className="block mb-1">
              <span className="t-body-sm text-fg-3">Beschreibung</span>
              <span className="text-fg-3 ml-1">(optional)</span>
            </label>
            <textarea
              value={internship.description || ''}
              onChange={(e) => updateInternship(i, 'description', e.target.value)}
              placeholder="Was hast du gemacht?"
              rows={3}
              className="bp-input w-full resize-y"
            />
          </div>

          <div>
            <p className="t-body-sm text-fg-3 mb-2">Genutzte Skills</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(i, skill)}
                  className={`
                    px-3 py-1 text-t-body-sm rounded-full border transition-colors
                    ${(internship.skillsUsed || []).includes(skill)
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-fg-3 hover:border-fg-3/30'}
                  `}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="bp-btn-ghost t-body-sm"
        >
          Überspringen
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="bp-btn-primary"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
