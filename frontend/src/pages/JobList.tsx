import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { JobCard } from '../components/matching/JobCard';
import { JobFilterBar } from '../components/matching/JobFilterBar';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import api from '../lib/api';
import type { AggregatedJob, Job } from '@shared/types';

export default function JobList() {
  const [jobs, setJobs] = useState<AggregatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res = await api.get(`/jobs?${params}`);
      const result: Job[] = res.data.jobs;
      const mapped: AggregatedJob[] = result.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        canton: job.canton,
        category: job.category,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        source: 'job-pal',
        sourceName: 'Job-Pal',
        url: `/jobs/${job.id}`,
        publishedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      }));
      setJobs(mapped);
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
