import { Badge } from '../ui/Badge';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const getColor = () => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'info';
  };

  const getSize = () => {
    if (size === 'lg') return 't-num-lg';
    if (size === 'sm') return 't-num-sm';
    return 't-num';
  };

  return (
    <div className="flex flex-col items-center">
      <Badge variant={getColor() as any} className={getSize()}>
        {score}%
      </Badge>
      <span className="t-caption text-fg-3 mt-1">Match</span>
    </div>
  );
}
