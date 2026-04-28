import { useProfileStore } from '../../stores/profile-store';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

export function ProfilePreview() {
  const { draft } = useProfileStore();

  return (
    <div className="bp-card space-y-6">
      {/* Header */}
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
              {draft.canton && `, ${draft.canton}`}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {draft.bio && (
        <div>
          <p className="eyebrow mb-2">Über mich</p>
          <p className="t-body text-fg-2">{draft.bio}</p>
        </div>
      )}

      {/* Skills */}
      {draft.skills?.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Skills</p>
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
      {draft.languages?.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Sprachen</p>
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

      {/* Education */}
      {draft.education?.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Bildung</p>
          <div className="space-y-3">
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
        </div>
      )}
    </div>
  );
}
