import { useProfileStore } from '../../stores/profile-store';

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'HTML/CSS', 'Python',
  'SQL', 'Git', 'Agile/Scrum', 'Kommunikation', 'Teamarbeit',
  'Problem Solving', 'Projektmanagement', 'Microsoft Office',
  'Deutsch', 'Französisch', 'Englisch',
];

const LEVELS = [
  { value: 'beginner', label: 'Anfänger' },
  { value: 'intermediate', label: 'Fortgeschritten' },
  { value: 'advanced', label: 'Fortgeschritten' },
  { value: 'expert', label: 'Experte' },
] as const;

export function SkillSelector() {
  const { draft, setDraft } = useProfileStore();
  const skills = draft.skills || [];

  const addSkill = (name: string) => {
    if (skills.some((s: any) => s.name === name)) return;
    setDraft({ skills: [...skills, { name, level: 'beginner' }] });
  };

  const updateLevel = (name: string, level: any) => {
    setDraft({
      skills: skills.map((s: any) =>
        s.name === name ? { ...s, level } : s
      ),
    });
  };

  const removeSkill = (name: string) => {
    setDraft({ skills: skills.filter((s: any) => s.name !== name) });
  };

  return (
    <div className="space-y-4">
      {/* Add skill */}
      <div className="flex gap-2 flex-wrap">
        {COMMON_SKILLS.filter((s) => !skills.some((sk: any) => sk.name === s)).map((skill) => (
          <button
            key={skill}
            onClick={() => addSkill(skill)}
            className="bp-btn-secondary text-t-body-sm"
          >
            + {skill}
          </button>
        ))}
      </div>

      {/* Skill list */}
      <div className="space-y-2">
        {skills.map((skill: any) => (
          <div
            key={skill.name}
            className="flex items-center justify-between gap-4 bp-card p-2"
          >
            <span className="t-body text-fg-1">{skill.name}</span>
            <div className="flex items-center gap-2">
              <select
                value={skill.level}
                onChange={(e) => updateLevel(skill.name, e.target.value)}
                className="bp-input py-1 px-2 text-t-body-sm"
              >
                {LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeSkill(skill.name)}
                className="text-fg-3 hover:text-red transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
