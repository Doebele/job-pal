import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../stores/auth-store';
import api from '../lib/api';
import type { JobDraft } from '@shared/types';

const DEFAULT_DRAFT: JobDraft = {
  title: '',
  description: '',
  category: '',
  location: '',
  canton: '',
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: 'CHF',
  startDate: null,
  duration: null,
  applicationDeadline: null,
  isPublished: false,
};

export default function CreateJob() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const [draft, setDraft] = useState<JobDraft>(DEFAULT_DRAFT);
  const [isSaving, setIsSaving] = useState(false);

  if (user?.role !== 'employer') {
    return (
      <Layout>
        <div className="bp-card dashed-accent p-8 text-center">
          <p className="t-body text-fg-2">Diese Seite ist nur fuer Arbeitgeber verfuegbar.</p>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/jobs', draft);
      addToast('Stelleninserat erstellt', 'success');
      navigate('/my-jobs');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Erstellen fehlgeschlagen';
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="t-h1 text-fg-1 mb-1">Neues Stelleninserat</h1>
          <p className="t-body text-fg-2">Erfasse ein Inserat fuer Berufsanfanger.</p>
        </div>

        <form onSubmit={handleSubmit} className="bp-card space-y-4">
          <Input
            label="Titel"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <div>
            <label className="t-body-sm text-fg-3 mb-2 block">Beschreibung</label>
            <textarea
              className="bp-input min-h-36"
              value={draft.description}
              onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Kategorie"
            value={draft.category}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            required
          />
          <Input
            label="Ort"
            value={draft.location}
            onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))}
            required
          />
          <Input
            label="Kanton"
            value={draft.canton || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, canton: e.target.value }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Lohn von"
              type="number"
              value={draft.salaryMin ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, salaryMin: e.target.value ? Number(e.target.value) : null }))}
            />
            <Input
              label="Lohn bis"
              type="number"
              value={draft.salaryMax ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, salaryMax: e.target.value ? Number(e.target.value) : null }))}
            />
          </div>
          <Input
            label="Startdatum"
            value={draft.startDate || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value || null }))}
          />
          <Input
            label="Dauer"
            value={draft.duration || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value || null }))}
          />
          <Input
            label="Bewerbungsfrist"
            value={draft.applicationDeadline || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, applicationDeadline: e.target.value || null }))}
          />
          <label className="flex items-center gap-2 t-body-sm text-fg-2">
            <input
              type="checkbox"
              checked={Boolean(draft.isPublished)}
              onChange={(e) => setDraft((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            Sofort publizieren
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/my-jobs')}>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Speichern...' : 'Inserat erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
