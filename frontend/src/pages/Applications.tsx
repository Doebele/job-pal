import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import api from '../lib/api';

interface Application {
  id: string;
  jobTitle: string;
  companyLocation: string;
  canton: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'In Prüfung',
  reviewed: 'Durchgesehen',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning',
  reviewed: 'info',
  accepted: 'success',
  rejected: 'danger',
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data.applications);
    } catch {
      addToast('Bewerbungen konnten nicht geladen werden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Application['status']) => {
    try {
      await api.put(`/applications/${id}`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      addToast('Status aktualisiert', 'success');
    } catch {
      addToast('Status konnte nicht aktualisiert werden', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-CH');
  };

  if (loading) {
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

  if (applications.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="t-h1 text-fg-1 mb-1">Deine Bewerbungen</h1>
            <p className="t-body text-fg-2">Übersicht aller eingereichten Bewerbungen</p>
          </div>
          <div className="bp-card dashed-accent text-center p-12">
            <p className="t-body text-fg-2 mb-4">Noch keine Bewerbungen vorhanden</p>
            <Button variant="primary" onClick={() => window.location.href = '/jobs'}>
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
          <h1 className="t-h1 text-fg-1 mb-1">Deine Bewerbungen</h1>
          <p className="t-body text-fg-2">Übersicht aller eingereichten Bewerbungen</p>
        </div>

        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bp-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="t-h2 text-fg-1 mb-1">{app.jobTitle}</h3>
                  <p className="t-body-sm text-fg-3">
                    {app.companyLocation}
                    {app.canton && ` (${app.canton})`}
                  </p>
                  <p className="t-caption text-fg-3 mt-1">
                    Eingereicht am {formatDate(app.appliedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={STATUS_BADGE[app.status] as any}>
                    {STATUS_LABELS[app.status]}
                  </Badge>
                  {app.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(app.id, 'reviewed')}
                    >
                      Als durchgesehen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
