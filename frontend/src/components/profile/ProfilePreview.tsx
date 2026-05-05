import { useWizardStore } from '../../stores/wizard-store';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { SCHULSYSTEM_CH, SCHWEIZER_KANTONE } from '@shared/constants';
import type { SchoolType } from '@shared/types';

export function ProfilePreview() {
  const { draft } = useWizardStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bp-card space-y-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${draft.firstName || 'F'} ${draft.lastName || 'M'}`}
            size="lg"
          />
          <div>
            <h3 className="t-h1 text-fg-1">
              {draft.firstName || 'Vorname'} {draft.lastName || 'Nachname'}
            </h3>
            {draft.city && draft.postalCode && (
              <p className="t-body-sm text-fg-3">
                {draft.postalCode} {draft.city}
                {draft.canton && `, ${SCHWEIZER_KANTONE[draft.canton] ?? draft.canton}`}
              </p>
            )}
            {draft.phone && (
              <p className="t-body-sm text-fg-3">{draft.phone}</p>
            )}
          </div>
        </div>

        {draft.bio && (
          <div>
            <p className="eyebrow mb-2">Über mich</p>
            <p className="t-body text-fg-2">{draft.bio}</p>
          </div>
        )}
      </div>

      {/* Schulabschluss */}
      {draft.schoolType && (
        <div className="bp-card space-y-2">
          <p className="eyebrow">Bildung</p>
          <div className="space-y-1">
            <p className="t-body text-fg-1">
              {SCHULSYSTEM_CH[draft.schoolType as SchoolType] ?? draft.schoolType}
              {draft.schoolName && ` — ${draft.schoolName}`}
            </p>
            {draft.graduationYear && (
              <p className="t-body-sm text-fg-3">Abschluss {draft.graduationYear}</p>
            )}
            {draft.wantsTraining && (
              <Badge variant="success">Suche eine Lehrstelle</Badge>
            )}
          </div>
          {(draft.education ?? []).length > 0 && (
            <div className="space-y-3 pt-2">
              {(draft.education as any[]).map((edu: any) => (
                <div key={edu.institution} className="border-l-2 border-border pl-3">
                  <p className="t-body text-fg-1">{edu.degree}</p>
                  <p className="t-body-sm text-fg-3">{edu.institution}</p>
                  <p className="t-caption text-fg-3">
                    {edu.startYear}–{edu.endYear || 'heute'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Berufswahl */}
      {(draft.targetRoles ?? []).length > 0 && (
        <div className="bp-card space-y-3">
          <p className="eyebrow">Berufswahl</p>
          {(draft.targetRoles as any[]).map((role: any, i: number) => (
            <div key={i} className="border-l-2 border-border pl-3">
              <p className="t-body text-fg-1 font-medium">{role.title}</p>
              <p className="t-body-sm text-fg-2">{role.branch}</p>
              <p className="t-caption text-fg-3">
                {role.priority === 'primary' ? 'Hauptwunsch' : role.priority === 'secondary' ? 'Nebenwunsch' : 'Erkundend'}
              </p>
            </div>
          ))}
          {(draft.preferredCantons ?? []).length > 0 && (
            <div>
              <p className="t-body-sm text-fg-3 mb-1">Bevorzugte Kantone</p>
              <div className="flex flex-wrap gap-1.5">
                {(draft.preferredCantons as string[]).map((c) => (
                  <Badge key={c} variant="info">{SCHWEIZER_KANTONE[c] ?? c}</Badge>
                ))}
              </div>
            </div>
          )}
          {draft.availableFrom && (
            <p className="t-body-sm text-fg-3">Verfügbar ab: <span className="text-fg-2">{draft.availableFrom}</span></p>
          )}
        </div>
      )}

      {/* Soft Skills */}
      {(draft.softSkills ?? []).length > 0 && (
        <div className="bp-card space-y-3">
          <p className="eyebrow">Soft Skills</p>
          {(draft.softSkills as any[]).map((skill: any, i: number) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <span className="t-body text-fg-1">{skill.name}</span>
                <Badge variant="info">
                  {skill.level === 'developing' ? 'In Entwicklung' : skill.level === 'proficient' ? 'Gut' : 'Fortgeschritten'}
                </Badge>
              </div>
              {skill.evidence && (
                <p className="t-caption text-fg-3 italic mt-0.5">"{skill.evidence}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hard Skills */}
      {(draft.skills ?? []).length > 0 && (
        <div className="bp-card space-y-2">
          <p className="eyebrow">Hard Skills</p>
          <div className="flex flex-wrap gap-2">
            {(draft.skills as any[]).map((skill: any) => (
              <Badge key={skill.name} variant="info">
                {skill.name} — {skill.level}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {(draft.languages ?? []).length > 0 && (
        <div className="bp-card space-y-2">
          <p className="eyebrow">Sprachen</p>
          <div className="space-y-1">
            {(draft.languages as any[]).map((lang: any) => (
              <div key={lang.language} className="flex items-center justify-between">
                <span className="t-body text-fg-2">{lang.language}</span>
                <Badge variant="info">{lang.level}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Praktika */}
      {(draft.internships ?? []).length > 0 && (
        <div className="bp-card space-y-3">
          <p className="eyebrow">Praktika & Einsätze</p>
          {(draft.internships as any[]).map((internship: any, i: number) => (
            <div key={i} className="border-l-2 border-border pl-3 space-y-1">
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
        </div>
      )}
    </div>
  );
}
