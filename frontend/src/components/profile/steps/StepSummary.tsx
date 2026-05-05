import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../../../stores/wizard-store';
import { Badge } from '../../ui/Badge';

interface StepSummaryProps {
  onComplete: () => void;
  onStep: (step: number) => void;
}

const STEP_MAP: Record<number, string> = {
  0: 'Persönliches',
  1: 'Bildung',
  2: 'Berufswahl',
  3: 'Soft Skills',
  4: 'Praktika',
  5: 'CV Upload',
  6: 'Zusammenfassung',
};

export function StepSummary({ onComplete, onStep }: StepSummaryProps) {
  const navigate = useNavigate();
  const { draft, cvParsedData, saveProfile, isSaving, saveError } = useWizardStore();

  const handleSave = async () => {
    try {
      await saveProfile();
      onComplete();
      navigate('/profile');
    } catch {
      // Error handled in store
    }
  };

  const schoolTypeLabel = draft.schoolType
    ? {
        sec1: 'Sekundarstufe 1',
        sec2_lehre: 'Berufsllehre (Sek 2)',
        sec2_bms: 'Berufsmaturität (BMS)',
        matura: 'Matura / Gymnasium',
        fms: 'FMS',
        other: 'Andere',
      }[draft.schoolType]
    : 'Nicht angegeben';

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Zusammenfassung</p>
        <p className="t-body text-fg-2 mb-4">
          Überprüfe dein Profil vor dem Speichern. Klicke auf einen Schritt, um zurückzugehen.
        </p>
      </div>

      {/* Personal Info */}
      <SummarySection
        title="Persönliche Daten"
        step={0}
        onStep={() => onStep(0)}
        hasData={!!draft.firstName || !!draft.lastName}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <SummaryField label="Vorname" value={draft.firstName} />
          <SummaryField label="Nachname" value={draft.lastName} />
          {draft.bio && <SummaryField label="E-Mail" value={draft.bio} />}
          {draft.phone && <SummaryField label="Telefon" value={draft.phone} />}
          {draft.address && (
            <>
              <SummaryField label="Strasse" value={draft.address} />
              <SummaryField label="PLZ / Ort" value={`${draft.postalCode} ${draft.city}`} />
            </>
          )}
          {draft.canton && <SummaryField label="Kanton" value={draft.canton} />}
        </div>
      </SummarySection>

      {/* Education */}
      <SummarySection
        title="Bildung"
        step={1}
        onStep={() => onStep(1)}
        hasData={!!draft.schoolType}
      >
        <div className="space-y-2">
          <SummaryField label="Schulabschluss" value={schoolTypeLabel} />
          {draft.schoolName && <SummaryField label="Schule / Lehrbetrieb" value={draft.schoolName} />}
          {draft.graduationYear && <SummaryField label="Abschlussjahr" value={String(draft.graduationYear)} />}
          {draft.wantsTraining && (
            <div className="pt-1">
              <Badge variant="success">Suche eine Lehrstelle</Badge>
            </div>
          )}
        </div>
      </SummarySection>

      {/* Target Roles */}
      <SummarySection
        title="Berufswahl"
        step={2}
        onStep={() => onStep(2)}
        hasData={draft.targetRoles?.length > 0}
      >
        <div className="space-y-2">
          {draft.targetRoles?.map((role: any, i: number) => (
            <div key={i} className="bp-card bg-surface-2/50 p-3">
              <p className="t-body text-fg-1 font-medium">{role.title}</p>
              <p className="t-body-sm text-fg-2">{role.branch}</p>
              <p className="t-caption text-fg-3">
                {role.priority === 'primary' ? 'Hauptwunsch' : role.priority === 'secondary' ? 'Nebenwunsch' : 'Erkundend'}
              </p>
            </div>
          ))}
          {draft.preferredCantons?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {draft.preferredCantons.map((c: string) => (
                <Badge key={c} variant="info">{c}</Badge>
              ))}
            </div>
          )}
          {draft.availableFrom && (
            <SummaryField label="Verfügbar ab" value={draft.availableFrom} />
          )}
        </div>
      </SummarySection>

      {/* Soft Skills */}
      <SummarySection
        title="Soft Skills"
        step={3}
        onStep={() => onStep(3)}
        hasData={draft.softSkills?.length > 0}
      >
        {draft.softSkills?.map((skill: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="t-body text-fg-1">{skill.name}</span>
              <Badge variant="info">
                {skill.level === 'developing' ? 'In Entwicklung' : skill.level === 'proficient' ? 'Gut' : 'Fortgeschritten'}
              </Badge>
            </div>
            {skill.evidence && (
              <p className="t-caption text-fg-3 italic">"{skill.evidence}"</p>
            )}
          </div>
        ))}
      </SummarySection>

      {/* Hard Skills */}
      {draft.skills?.length > 0 && (
        <SummarySection title="Hard Skills" hasData={true}>
          <div className="flex flex-wrap gap-1.5">
            {draft.skills.map((skill: any, i: number) => (
              <Badge key={i} variant="info">
                {skill.name} ({skill.level})
              </Badge>
            ))}
          </div>
        </SummarySection>
      )}

      {/* Internships */}
      <SummarySection
        title="Praktika & Einsätze"
        step={4}
        onStep={() => onStep(4)}
        hasData={draft.internships?.length > 0}
      >
        {draft.internships?.map((internship: any, i: number) => (
          <div key={i} className="bp-card bg-surface-2/50 p-3 space-y-1">
            <p className="t-body text-fg-1 font-medium">{internship.role}</p>
            <p className="t-body-sm text-fg-2">{internship.company}</p>
            {internship.durationMonths > 0 && (
              <p className="t-caption text-fg-3">{internship.durationMonths} Monate</p>
            )}
            {internship.skillsUsed?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {internship.skillsUsed.map((s: string, j: number) => (
                  <Badge key={j} variant="info">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </SummarySection>

      {/* CV Analysis */}
      {cvParsedData && (
        <SummarySection title="CV Analyse" hasData={true}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">
                {Math.round(cvParsedData.confidence * 100)}% Übereinstimmung
              </Badge>
            </div>
            {(cvParsedData.education?.length ?? 0) > 0 && (
              <SummaryField label="Bildung (vom CV)" value={`${cvParsedData.education?.length ?? 0} Einträge`} />
            )}
            {(cvParsedData.skills?.length ?? 0) > 0 && (
              <SummaryField label="Skills (vom CV)" value={`${cvParsedData.skills?.length ?? 0} erkannt`} />
            )}
          </div>
        </SummarySection>
      )}

      {/* Error */}
      {saveError && (
        <div className="bp-card bg-red/5 border-red/20 p-3">
          <p className="t-body-sm text-red">{saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => onStep(0)}
          className="bp-btn-ghost t-body-sm"
        >
          Wieder von vorne beginnen
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bp-btn-primary"
        >
          {isSaving ? 'Speichern...' : 'Profil abschliessen'}
        </button>
      </div>
    </div>
  );
}

function SummarySection({
  title,
  step,
  onStep,
  hasData,
  children,
}: {
  title: string;
  step?: number;
  onStep?: () => void;
  hasData: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={onStep ? 'cursor-pointer hover:bg-surface/30 -m-3 p-3 rounded-lg transition-colors' : ''} onClick={onStep}>
      <div className="flex items-center justify-between mb-2">
        <p className="t-h3 text-fg-1">{title}</p>
        {!hasData && (
          <span className="t-caption text-fg-3">Übersprungen</span>
        )}
        {step !== undefined && onStep && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onStep(); }}
            className="t-body-sm text-accent hover:text-accent/80"
          >
            Bearbeiten
          </button>
        )}
      </div>
      {hasData && children && (
        <div className="space-y-2 pl-3 border-l-2 border-border">
          {children}
        </div>
      )}
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="t-caption text-fg-3">{label}</p>
      <p className="t-body text-fg-1">{value}</p>
    </div>
  );
}
