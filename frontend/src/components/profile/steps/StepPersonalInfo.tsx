import { useWizardStore } from '../../../stores/wizard-store';
import { Input } from '../../ui/Input';
import { SCHWEIZER_KANTONE } from '@shared/constants';

const kantoneOptions = Object.entries(SCHWEIZER_KANTONE).map(([key, label]) => ({
  value: key,
  label,
}));

interface StepPersonalInfoProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function StepPersonalInfo({ onComplete, onSkip }: StepPersonalInfoProps) {
  const { draft, setDraft } = useWizardStore();

  const handleChange = (field: string, value: string) => {
    setDraft({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Persönliche Daten</p>
        <p className="t-body text-fg-2 mb-4">
          Erzähl uns etwas über dich. Dieser Schritt ist verpflichtend.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Vorname *"
          value={draft.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="Max"
        />
        <Input
          label="Nachname *"
          value={draft.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Muster"
        />
      </div>

      <Input
        label="E-Mail"
        value={draft.bio || ''}
        onChange={(e) => handleChange('bio', e.target.value)}
        placeholder="max@beispiel.ch"
        helper="Wird für Bewerbungen verwendet"
      />

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
        <label className="block mb-1">
          <span className="t-h3 text-fg-1">Kanton</span>
          <span className="text-fg-3 ml-1">(optional)</span>
        </label>
        <select
          value={draft.canton || ''}
          onChange={(e) => handleChange('canton', e.target.value || '')}
          className="bp-input w-full max-w-[200px]"
        >
          <option value="">Bitte wählen...</option>
          {kantoneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="bp-btn-ghost t-body-sm"
        >
          Später ausfüllen
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
