import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../stores/auth-store';
import api from '../lib/api';
import type { Job } from '@shared/types';

type JobWithDates = Omit<Job, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export default function MyJobs() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const [items, setItems] = useState<JobWithDates[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/jobs/mine');
      setItems(res.data.jobs ?? []);
    } catch {
      addToast('Eigene Inserate konnten nicht geladen werden', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  if (user?.role !== 'employer') {
    return (
      <Layout>
        <div className="bp-card dashed-accent p-8 text-center">
          <p className="t-body text-fg-2">Diese Seite ist nur fuer Arbeitgeber verfuegbar.</p>
        </div>
      </Layout>
    );
  }

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Inserat wirklich loeschen?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      addToast('Inserat geloescht', 'success');
      await loadJobs();
    } catch {
      addToast('Loeschen fehlgeschlagen', 'error');
    }
  };

  const togglePublish = async (job: JobWithDates) => {
    try {
      await api.patch(`/jobs/${job.id}`, { isPublished: !job.isPublished });
      addToast('Publikationsstatus aktualisiert', 'success');
      await loadJobs();
    } catch {
      addToast('Status konnte nicht aktualisiert werden', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="t-h1 text-fg-1 mb-1">Meine Stelleninserate</h1>
            <p className="t-body text-fg-2">Verwalte publizierte und Entwurf-Inserate.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/jobs/new')}>
            Neues Inserat
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="bp-card h-28" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bp-card dashed-accent p-12 text-center">
            <p className="t-body text-fg-2 mb-4">Noch keine Inserate vorhanden.</p>
            <Button variant="primary" onClick={() => navigate('/jobs/new')}>
              Erstes Inserat erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((job) => (
              <div key={job.id} className="bp-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/jobs/${job.id}`} className="t-h2 text-fg-1 hover:text-accent transition-colors">
                      {job.title}
                    </Link>
                    <p className="t-body-sm text-fg-3 mt-1">
                      {job.category} · {job.location}
                      {job.canton ? ` (${job.canton})` : ''}
                    </p>
                    <p className="t-caption text-fg-3 mt-1">
                      {job.isPublished ? 'Publiziert' : 'Entwurf'} · Aktualisiert am{' '}
                      {new Date(job.updatedAt).toLocaleDateString('de-CH')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(job)}>
                      {job.isPublished ? 'Depublizieren' : 'Publizieren'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(job.id)}>
                      Loeschen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
