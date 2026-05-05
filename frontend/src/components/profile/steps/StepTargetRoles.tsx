import { BRANCHEN, JUNIOR_BRANCHEN } from '@shared/constants';
import { useWizardStore } from '../../../stores/wizard-store';
import { SCHWEIZER_KANTONE } from '@shared/constants';

interface StepTargetRolesProps {
  onComplete: () => void;
}

type TargetRolePriority = import('@shared/types').TargetRolePriority;

const PRIORITY_OPTIONS: { value: TargetRolePriority; label: string }[] = [
  { value: 'primary', label: 'Haupt' },
  { value: 'secondary', label: 'Neben' },
  { value: 'exploratory', label: 'Offen' },
];

const BERUFE_BY_BRANCH: Record<string, string[]> = {
  'IT & Software': [
    'Informatiker/in EFZ (Applikationsentwicklung)',
    'Informatiker/in EFZ (Plattformentwicklung)',
    'Mediamatiker/in EFZ',
    'Kaufmann/-frau EFZ (IT)',
    'ICT-Fachmann/-frau EFZ',
  ],
  'Banken & Finanzen': [
    'Kaufmann/-frau EFZ (Bank)',
    'Finanzfachmann/-frau EFZ',
    'Kaufmann/-frau EFZ (Treuhand)',
  ],
  'Versicherungen': [
    'Kaufmann/-frau EFZ (Versicherung)',
    'Versicherungsfachmann/-frau EFZ',
  ],
  'E-Commerce': [
    'Kaufmann/-frau EFZ (E-Commerce)',
    'Detailhandelsfachmann/-frau EFZ',
    'Mediamatiker/in EFZ',
  ],
  'Maschinenbau': [
    'Polymechaniker/in EFZ',
    'Konstrukteur/in EFZ',
    'Produktionsmechaniker/in EFZ',
    'Mechanikpraktiker/in EBA',
    'Anlagen- und Apparatebauer/in EFZ',
  ],
  'Pharmazie & Life Sciences': [
    'Pharma-Assistent/in EFZ',
    'Laborant/in EFZ',
    'Drogist/in EFZ',
    'Chemielaborant/in EFZ',
  ],
  'Handel': [
    'Detailhandelsfachmann/-frau EFZ',
    'Detailhandelsassistent/in EBA',
    'Kaufmann/-frau EFZ',
  ],
  'Gesundheitswesen': [
    'Fachmann/-frau Gesundheit EFZ',
    'Medizinische/r Praxisassistent/in EFZ',
    'Zahnarztassistent/in EFZ',
    'Fachmann/-frau Betreuung EFZ',
  ],
  'Bildung': [
    'Fachmann/-frau Betreuung EFZ (Kinder)',
    'Fachmann/-frau Betreuung EFZ (Behinderte)',
    'Fachmann/-frau Betreuung EFZ (Betagte)',
    'Assistent/in Gesundheit und Soziales EBA',
  ],
  'Öffentlicher Dienst': [
    'Kaufmann/-frau EFZ (öffentl. Verwaltung)',
    'Kaufmann/-frau EFZ (Gemeindeverwaltung)',
  ],
  'Logistik & Transport': [
    'Logistiker/in EFZ',
    'Logistikassistent/in EBA',
    'Kaufmann/-frau EFZ (Spedition)',
    'Strassentransportfachmann/-frau EFZ',
  ],
  'Bauwesen': [
    'Hochbauzeichner/in EFZ',
    'Maurer/in EFZ',
    'Zimmermann/-frau EFZ',
    'Gebäudetechnikplaner/in EFZ',
    'Sanitärinstallateur/in EFZ',
  ],
  'Medien & Kommunikation': [
    'Mediamatiker/in EFZ',
    'Grafiker/in EFZ',
    'Polygraf/in EFZ',
    'Kaufmann/-frau EFZ (Medien)',
  ],
  'Gastronomie & Hotellerie': [
    'Koch/Köchin EFZ',
    'Restaurantfachmann/-frau EFZ',
    'Hotelfachmann/-frau EFZ',
    'Bäcker-Konditor/in EFZ',
  ],
  'Rechtswesen': [
    'Kaufmann/-frau EFZ',
    'Rechtspraktikant/in',
  ],
  'Energie & Umwelt': [
    'Elektroinstallateur/in EFZ',
    'Netzelektriker/in EFZ',
    'Gebäudeautomatiker/in EFZ',
    'Umweltpraktiker/in EBA',
  ],
  'Tourismus': [
    'Kaufmann/-frau EFZ (Tourismus)',
    'Reisefachmann/-frau EFZ',
    'Hotelfachmann/-frau EFZ',
  ],
  'Andere': [],
};

export function StepTargetRoles({ onComplete }: StepTargetRolesProps) {
  const { draft, setDraft } = useWizardStore();

  const addRole = () => {
    setDraft({
      targetRoles: [...draft.targetRoles, {
        title: '',
        branch: JUNIOR_BRANCHEN[0],
        priority: 'secondary' as TargetRolePriority,
      }],
    });
  };

  const updateRole = (index: number, field: keyof import('@shared/types').TargetRole, value: string | TargetRolePriority) => {
    const newRoles = [...draft.targetRoles];
    if (field === 'branch') {
      newRoles[index] = { ...newRoles[index], branch: value as string, title: '' };
    } else {
      newRoles[index] = { ...newRoles[index], [field]: value };
    }
    setDraft({ targetRoles: newRoles });
  };

  const removeRole = (index: number) => {
    setDraft({ targetRoles: draft.targetRoles.filter((_, i) => i !== index) });
  };

  const toggleCanton = (canton: string) => {
    const newCantons = draft.preferredCantons.includes(canton)
      ? draft.preferredCantons.filter((c) => c !== canton)
      : [...draft.preferredCantons, canton];
    setDraft({ preferredCantons: newCantons });
  };

  const allBranchen = [
    ...JUNIOR_BRANCHEN,
    ...BRANCHEN.filter((b) => !JUNIOR_BRANCHEN.includes(b)),
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Berufswahl</p>
        <p className="t-body text-fg-2 mb-4">
          Welche Berufe interessieren dich? Dieser Schritt ist verpflichtend.
        </p>
      </div>

      {/* Target roles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="t-h3 text-fg-1">Gewünschte Berufe / Branchen</p>
          <button type="button" onClick={addRole} className="t-body-sm text-accent hover:text-accent/80">
            + Hinzufügen
          </button>
        </div>

        {/* Header */}
        {draft.targetRoles.length > 0 && (
          <div className="grid gap-2 px-1" style={{ gridTemplateColumns: '1fr 1.4fr auto auto' }}>
            <span className="t-caption text-fg-3">Branche</span>
            <span className="t-caption text-fg-3">Berufsbezeichnung</span>
            <span className="t-caption text-fg-3">Priorität</span>
            <span />
          </div>
        )}

        {draft.targetRoles.length === 0 && (
          <div className="bp-card text-center py-8 border-dashed">
            <p className="t-body text-fg-3">Noch keine Berufe hinzugefügt</p>
            <button type="button" onClick={addRole} className="t-body-sm text-accent mt-2">
              Ersten Beruf hinzufügen
            </button>
          </div>
        )}

        {draft.targetRoles.map((role, i) => {
          const listId = `berufe-list-${i}`;
          const suggestions = BERUFE_BY_BRANCH[role.branch] ?? [];
          return (
            <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 1.4fr auto auto' }}>
              {/* Branche */}
              <select
                value={role.branch}
                onChange={(e) => updateRole(i, 'branch', e.target.value)}
                className="bp-input w-full text-sm"
              >
                {allBranchen.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Berufsbezeichnung mit datalist */}
              <div className="relative">
                <input
                  type="text"
                  list={listId}
                  value={role.title}
                  onChange={(e) => updateRole(i, 'title', e.target.value)}
                  placeholder="Beruf eingeben oder wählen…"
                  className="bp-input w-full text-sm"
                />
                <datalist id={listId}>
                  {suggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Priorität */}
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateRole(i, 'priority', opt.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${
                      role.priority === opt.value
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'border-border text-fg-3 hover:border-fg-3/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Löschen */}
              <button
                type="button"
                onClick={() => removeRole(i)}
                className="text-fg-3 hover:text-fg-1 flex-shrink-0"
                title="Entfernen"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Preferred cantons */}
      <div className="space-y-3">
        <p className="t-h3 text-fg-1">Wunschkantone</p>
        <p className="t-caption text-fg-3">Alle Kantone an denen du arbeiten möchtest</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SCHWEIZER_KANTONE).map(([code, name]) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleCanton(code)}
              className={`px-3 py-1 text-t-body-sm rounded-full border transition-colors ${
                draft.preferredCantons.includes(code)
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border text-fg-3 hover:border-fg-3/30'
              }`}
            >
              {code} — {name}
            </button>
          ))}
        </div>
      </div>

      {/* Available from */}
      <div>
        <label className="block mb-1">
          <span className="t-h3 text-fg-1">Verfügbar ab</span>
          <span className="text-fg-3 ml-1">(optional)</span>
        </label>
        <input
          type="month"
          value={draft.availableFrom || ''}
          onChange={(e) => setDraft({ availableFrom: e.target.value || null })}
          className="bp-input w-full max-w-[200px]"
        />
      </div>

      <button type="button" onClick={onComplete} className="bp-btn-primary">
        Weiter
      </button>
    </div>
  );
}
