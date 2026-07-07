import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { JobCard } from '../components/matching/JobCard';
import { JobFilterBar } from '../components/matching/JobFilterBar';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useSourcesStore } from '../stores/sources-store';
import api from '../lib/api';
import type { AggregatedJob } from '@shared/types';

export default function JobList() {
  const [jobs, setJobs] = useState<AggregatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const enabledSourceIds = useSourcesStore((state) => state.enabledSourceIds);
  const sourceParam = enabledSourceIds.join(',');

  useEffect(() => {
    loadJobs();
  }, [filters, sourceParam]);

  const loadJobs = async () => {
    setLoading(true);
    if (enabledSourceIds.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (sourceParam) params.set('sources', sourceParam);

      const res = await api.get(`/jobs/search?${params}`);
      setJobs(res.data.jobs);
    } catch {
      addToast('Stellenangebote konnten nicht geladen werden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setFilters({});

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="t-h1 text-fg-1 mb-1">Stellenangebote</h1>
            <p className="t-body text-fg-2">Finde deine perfekte Lehrstelle oder Job</p>
          </div>
          <span className="t-caption text-fg-3">{jobs.length} Treffer</span>
        </div>

        <JobFilterBar onFilterChange={setFilters} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="bp-card h-40" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bp-card dashed-accent text-center p-12">
            <p className="t-body text-fg-2 mb-4">Keine Stellenangebote gefunden</p>
            <Button variant="ghost" onClick={handleReset}>
              Filter zurücksetzen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}
