import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { formatCHF, formatDate } from '../../lib/utils';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    canton: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    startDate: string | null;
    isPublished: boolean;
    createdAt: string;
  };
  matchScore?: number;
}

export function JobCard({ job, matchScore }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bp-card hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="t-h2 text-fg-1 group-hover:text-accent transition-colors">
            {job.title}
          </h3>
          <p className="t-body-sm text-fg-3">{job.category}</p>
        </div>
        {matchScore !== undefined && (
          <Badge variant={matchScore >= 70 ? 'success' : matchScore >= 40 ? 'warning' : 'info'}>
            {matchScore}% Match
          </Badge>
        )}
      </div>

      <p className="t-body-sm text-fg-2 mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center gap-4 text-fg-3">
        <span className="t-body-sm flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" />
          </svg>
          {job.location}
          {job.canton && ` (${job.canton})`}
        </span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="t-body-sm">
            {formatCHF(job.salaryMin)}{job.salaryMax ? `–${formatCHF(job.salaryMax)}` : ''}
          </span>
        )}
        <span className="t-caption text-fg-3 ml-auto">
          {formatDate(job.createdAt)}
        </span>
      </div>
    </Link>
  );
}
