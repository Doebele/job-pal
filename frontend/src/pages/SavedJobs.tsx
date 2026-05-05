import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useSavedJobsStore, STATUS_LABELS, STATUS_BADGE } from '../stores/saved-jobs-store';
import { formatCHF } from '../lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'saved', label: 'Gespeichert' },
  { value: 'contacted', label: 'Kontaktiert' },
  { value: 'application_sent', label: 'Bewerbung gesendet' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'invited', label: 'Eingeladen' },
];

export default function SavedJobs() {
  const { items, isLoading, loadSavedJobs, updateStatus, removeSavedJob, clearError } = useSavedJobsStore();
  const [statusFilter, setStatusFilter] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadSavedJobs(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = async (savedJobId: string, status: string) => {
    await updateStatus(savedJobId, status as any);
    addToast('Status aktualisiert', 'success');
  };

  const handleRemove = async (savedJobId: string) => {
    if (!window.confirm('Job aus der Liste entfernen?')) return;
    await removeSavedJob(savedJobId);
    addToast('Job entfernt', 'success');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="bp-card h-32" />
          ))}
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="t-h1 text-fg-1 mb-1">Meine gespeicherten Jobs</h1>
            <p className="t-body text-fg-2">Übersicht Ihrer gespeicherten Stellenangebote</p>
          </div>
          <div className="bp-card dashed-accent text-center p-12">
            <p className="t-body text-fg-2 mb-4">Noch keine gespeicherten Jobs vorhanden</p>
            <Button variant="primary" onClick={() => (window.location.href = '/jobs')}>
              Jobs durchsuchen
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="t-h1 text-fg-1 mb-1">Meine gespeicherten Jobs</h1>
          <p className="t-body text-fg-2">Übersicht Ihrer gespeicherten Stellenangebote</p>
        </div>

        <div className="bp-card">
          <label className="t-body-sm text-fg-3 mb-2 block">Filter nach Status</label>
          <select
            className="bp-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bp-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link to={`/jobs/${item.jobId}`} className="t-h2 text-fg-1 group-hover:text-accent transition-colors">
                      {item.job.title}
                    </Link>
                    <Badge variant={STATUS_BADGE[item.status] as any}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </div>
                  <p className="t-body-sm text-fg-3">
                    {item.job.category} &middot; {item.job.location}
                    {item.job.canton && ` (${item.job.canton})`}
                  </p>
                  {(item.job.salaryMin || item.job.salaryMax) && (
                    <p className="t-body-sm text-fg-3 mt-1">
                      {formatCHF(item.job.salaryMin)}
                      {item.job.salaryMax ? `–${formatCHF(item.job.salaryMax)}` : ''}
                    </p>
                  )}
                  {item.note && (
                    <p className="t-body-sm text-fg-2 mt-1 italic">"{item.note}"</p>
                  )}
                  <p className="t-caption text-fg-3 mt-1">
                    Gespeichert am {new Date(item.updatedAt).toLocaleDateString('de-CH')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="bp-input t-body-sm py-1"
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    {STATUS_FILTERS.filter((f) => f.value).map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)}>
                    Entfernen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
