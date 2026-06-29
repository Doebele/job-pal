import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { SCHWEIZER_KANTONE } from '@shared/constants';
import { useSavedJobsStore } from '../stores/saved-jobs-store';
import api from '../lib/api';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { toggleBookmark, items } = useSavedJobsStore();
  const isSaved = items.some((i) => i.jobId === id);

  const cantonLabel = job?.canton ? SCHWEIZER_KANTONE[job.canton] || job.canton : '';

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.job);
    } catch {
      addToast('Job konnte nicht geladen werden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/applications', {
        jobId: id,
        coverLetter,
      });
      addToast('Bewerbung erfolgreich abgeschickt!', 'success');
      setShowApply(false);
      setCoverLetter('');
    } catch {
      addToast('Bewerbung fehlgeschlagen', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="bp-card h-64" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="bp-card dashed-accent text-center p-12">
          <p className="t-body text-fg-2 mb-4">Job nicht gefunden</p>
          <Button variant="ghost" onClick={() => navigate('/jobs')}>
            Zurück zur Jobliste
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
          Zurück zur Jobliste
        </Button>

        {/* Job header */}
        <div className="bp-card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="t-h1 text-fg-1 mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-fg-3">
                <span className="t-body-sm flex items-center gap-1">
                  {job.location}
                  {cantonLabel && ` (${cantonLabel})`}
                </span>
                <Badge variant="info">{job.category}</Badge>
                {job.startDate && (
                  <span className="t-body-sm">Ab {job.startDate}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmark(id!)}
                className="p-2 rounded-base hover:bg-surface-2 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill={isSaved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={isSaved ? 'text-accent' : 'text-fg-3'}
                >
                  <path d="M4 2h8v12l-4-3-4 3V2z" />
                </svg>
              </button>
              <Button
                variant="primary"
                onClick={() => setShowApply(true)}
              >
                Bewerben
              </Button>
            </div>
          </div>

          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <div className="bp-card border-l-4 border-accent bg-accent/5">
              <span className="t-label text-fg-3 mb-1 block">Gehalt</span>
              <span className="t-num-lg text-fg-1">
                {job.salaryMin?.toLocaleString('de-CH')}
                {job.salaryMax ? ` – ${job.salaryMax.toLocaleString('de-CH')}` : ''}
                {job.salaryCurrency === 'CHF' ? ' CHF' : ` ${job.salaryCurrency}`}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bp-card">
          <span className="t-label text-fg-3 mb-2 block">Stellenbeschreibung</span>
          <div className="t-body text-fg-2 whitespace-pre-line">{job.description}</div>
        </div>

        {/* Application deadline */}
        {job.applicationDeadline && (
          <div className="bp-card border-l-4 border-yellow">
            <span className="t-label text-yellow mb-1 block">Bewerbungsfrist</span>
            <p className="t-body text-fg-1">{job.applicationDeadline}</p>
          </div>
        )}

        {/* Apply modal */}
        {showApply && (
          <div className="fixed inset-0 bg-bg/80 flex items-center justify-center z-50 p-6">
            <div className="bp-card max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="t-h1 text-fg-1">Bewerben</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowApply(false)}>
                  Schliessen
                </Button>
              </div>

              <span className="t-label text-fg-3 mb-1 block">Begleitschreiben (optional)</span>
              <textarea
                className="bp-input w-full min-h-[120px] resize-y"
                placeholder="Warum interessierst du dich für diese Stelle?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowApply(false)}>
                  Abbrechen
                </Button>
                <Button variant="primary" onClick={handleApply} isLoading={applying}>
                  Absenden
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
