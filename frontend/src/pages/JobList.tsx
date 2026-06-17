import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { JobCard } from '../components/matching/JobCard';
import { JobFilterBar } from '../components/matching/JobFilterBar';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { useSourcesStore } from '../stores/sources-store';
import { DEEPLINK_SOURCES } from '@shared/constants';
import api from '../lib/api';
import type { AggregatedJob } from '@shared/types';

export default function JobList() {
  const [jobs, setJobs] = useState<AggregatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const { enabledSourceIds } = useSourcesStore();

  useEffect(() => {
    loadJobs();
  }, [filters, enabledSourceIds]);

  const loadJobs = async () => {
    setLoading(true);
    setActiveFilters(filters);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (!params.has('sources') && enabledSourceIds.length > 0) {
        params.set('sources', enabledSourceIds.join(','));
      }

      const res = await api.get(`/jobs/search?${params}`);
      const result: AggregatedJob[] = res.data.jobs;
      setJobs(result);

      const counts: Record<string, number> = {};
      for (const job of result) {
        counts[job.sourceName] = (counts[job.sourceName] ?? 0) + 1;
      }
      setSourceBreakdown(counts);
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
          {Object.keys(sourceBreakdown).length > 0 && (
            <div className="hidden sm:flex gap-3 shrink-0">
              {Object.entries(sourceBreakdown).map(([name, count]) => (
                <span key={name} className="t-caption text-fg-3">
                  <span className="text-fg-1 font-medium">{count}</span> {name}
                </span>
              ))}
            </div>
          )}
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

        {!loading && (
          <div className="bp-card space-y-3">
            <p className="eyebrow">Weitere Suche auf externen Portalen</p>
            <p className="t-body-sm text-fg-2">
              Diese Portale können nicht direkt aggregiert werden — klicke um die Suche dort fortzusetzen.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEEPLINK_SOURCES.map((source) => (
                <a
                  key={source.id}
                  href={source.buildUrl(activeFilters.q, activeFilters.canton)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={source.description}
                  className="t-body-sm px-3 py-1.5 rounded-lg border border-border bg-surface-2 hover:border-accent/40 hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  {source.name}
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 3H3v10h10v-4M9 1h6v6M15 1L7 9" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
