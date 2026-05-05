import { useWizardStore } from '../../stores/wizard-store';
import { Input } from '../ui/Input';
import { SCHWEIZER_KANTONE } from '@shared/constants';

const kantoneOptions = Object.entries(SCHWEIZER_KANTONE).map(([key, label]) => ({
  value: key,
  label,
}));

interface ProfileFormProps {
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ProfileForm({ onSubmit, isLoading }: ProfileFormProps) {
  const { draft, setDraft, saveError } = useWizardStore();

  const handleChange = (field: string, value: string) => {
    setDraft({ [field]: value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Vorname"
          value={draft.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="Max"
        />
        <Input
          label="Nachname"
          value={draft.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Muster"
        />
      </div>

      <Input
        label="Telefon"
        value={draft.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="+41 79 000 00 00"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Strasse"
          value={draft.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Musterstrasse 1"
        />
        <Input
          label="PLZ"
          value={draft.postalCode}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          placeholder="8000"
        />
        <Input
          label="Stadt"
          value={draft.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Zürich"
        />
      </div>

      <div>
        <label className="t-body-sm text-fg-2 block mb-1">Kanton</label>
        <select
          value={draft.canton ?? ''}
          onChange={(e) => handleChange('canton', e.target.value)}
          className="bp-input w-full"
        >
          <option value="">Kanton wählen...</option>
          {kantoneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="t-body-sm text-fg-2 block mb-1">Bio</label>
        <textarea
          value={draft.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Kurze Beschreibung über dich..."
          rows={3}
          maxLength={2000}
          className="bp-input w-full resize-none"
        />
        <p className="t-caption text-fg-3 mt-1">Max. 2000 Zeichen</p>
      </div>

      {saveError && (
        <p className="t-body-sm text-red">{saveError}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bp-btn-primary"
        >
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
