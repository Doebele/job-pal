import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { formatCHF, formatDate } from '../../lib/utils';
import type { AggregatedJob } from '@shared/types';

const SOURCE_COLORS: Record<string, string> = {
  'job-pal': 'text-accent border-accent/30 bg-accent/5',
  'indeed-ch': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  'adzuna': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
};

interface JobCardProps {
  job: AggregatedJob;
  matchScore?: number;
  isSaved?: boolean;
  onBookmark?: () => void;
}

export function JobCard({ job, matchScore, isSaved, onBookmark }: JobCardProps) {
  const isExternal = job.url.startsWith('http');
  const colorClass = SOURCE_COLORS[job.source] ?? 'text-fg-3 border-border bg-surface-2';

  const cardContent = (
    <div className="bp-card hover:border-accent/30 transition-colors group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="t-h2 text-fg-1 group-hover:text-accent transition-colors truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {job.category && (
              <span className="t-body-sm text-fg-3">{job.category}</span>
            )}
            {job.company && (
              <span className="t-body-sm text-fg-2">{job.company}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {matchScore !== undefined && (
            <Badge variant={matchScore >= 70 ? 'success' : matchScore >= 40 ? 'warning' : 'info'}>
              {matchScore}% Match
            </Badge>
          )}
          <span className={`t-caption px-2 py-0.5 rounded-full border text-nowrap ${colorClass}`}>
            {job.sourceName}
          </span>
          {onBookmark && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark(); }}
              className="p-1 rounded hover:bg-surface-2 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                className={isSaved ? 'text-accent' : 'text-fg-3'}
              >
                <path d="M4 2h8v12l-4-3-4 3V2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="t-body-sm text-fg-2 mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center gap-4 text-fg-3 flex-wrap">
        <span className="t-body-sm flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" />
          </svg>
          {job.location}
          {job.canton && ` (${job.canton})`}
        </span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="t-body-sm">
            {formatCHF(job.salaryMin ?? null)}{job.salaryMax ? `–${formatCHF(job.salaryMax)}` : ''}
          </span>
        )}
        {isExternal && (
          <span className="t-caption text-fg-3 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 3H3v10h10v-4M9 1h6v6M15 1L7 9" />
            </svg>
            Externe Stelle
          </span>
        )}
        <span className="t-caption text-fg-3 ml-auto">
          {job.publishedAt ? formatDate(job.publishedAt) : ''}
        </span>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={job.url} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={job.url} className="block">
      {cardContent}
    </Link>
  );
}
