import { useState } from 'react';
import { SOFT_SKILL_SUGGESTIONS } from '@shared/constants';
import { useWizardStore } from '../../../stores/wizard-store';

type SoftSkillLevel = import('@shared/types').SoftSkillLevel;

const LEVEL_OPTIONS: { value: SoftSkillLevel; label: string }[] = [
  { value: 'developing', label: 'In Entwicklung' },
  { value: 'proficient', label: 'Gut' },
  { value: 'advanced', label: 'Fortgeschritten' },
];

export function StepSoftSkills({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const { draft, setDraft } = useWizardStore();

  const addSkill = (name: string) => {
    if (draft.softSkills.some((s: any) => s.name === name)) return;
    setDraft({
      softSkills: [...draft.softSkills, { name, evidence: '', level: 'developing' as SoftSkillLevel }],
    });
  };

  const removeSkill = (name: string) => {
    setDraft({ softSkills: draft.softSkills.filter((s: any) => s.name !== name) });
  };

  const updateSkill = (
    name: string,
    field: keyof import('@shared/types').SoftSkill,
    value: string | SoftSkillLevel
  ) => {
    setDraft({
      softSkills: draft.softSkills.map((s: any) =>
        s.name === name ? { ...s, [field]: value } : s
      ),
    });
  };

  const availableSuggestions = SOFT_SKILL_SUGGESTIONS.filter(
    (s) => !draft.softSkills.some((sk: any) => sk.name === s)
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Soft Skills</p>
        <p className="t-body text-fg-2 mb-4">
          Welche Stärken bringst du mit? Füge Beispiele (Evidence) hinzu, um dein Profil zu verstärken.
        </p>
      </div>

      {/* Add skills */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="t-h3 text-fg-1">Vorschläge</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="bp-btn-secondary text-t-body-sm"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom skill input */}
      <CustomSkillInput onAdd={(name) => name && addSkill(name)} />

      {/* Skills list */}
      {draft.softSkills.length > 0 && (
        <div className="space-y-3">
          <p className="t-h3 text-fg-1">Deine Soft Skills</p>
          {draft.softSkills.map((skill: any) => (
            <div key={skill.name} className="bp-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="t-body text-fg-1 font-medium">{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="text-fg-3 hover:text-red transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block mb-1">
                  <span className="t-body-sm text-fg-3">Level</span>
                </label>
                <select
                  value={skill.level}
                  onChange={(e) => updateSkill(skill.name, 'level', e.target.value as SoftSkillLevel)}
                  className="bp-input w-full max-w-[200px]"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">
                  <span className="t-body-sm text-fg-3">Beispiel / Evidence</span>
                  <span className="text-fg-3 ml-1">(optional)</span>
                </label>
                <textarea
                  value={skill.evidence || ''}
                  onChange={(e) => updateSkill(skill.name, 'evidence', e.target.value)}
                  placeholder="z.B. 'Habe als Gruppenleiter ein Projekt mit 5 Personen koordiniert'"
                  rows={2}
                  className="bp-input w-full resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}

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

function CustomSkillInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Eigenen Skill hinzufügen..."
        className="bp-input flex-1"
      />
      <button type="submit" className="bp-btn-secondary">
        + Hinzufügen
      </button>
    </form>
  );
}
