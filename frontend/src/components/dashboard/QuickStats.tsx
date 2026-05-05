import { Card } from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card className="min-w-[180px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow mb-1">{label}</p>
          <p className="t-num-xl text-fg-1">{value}</p>
          {trend && (
            <p className={trend.positive ? 't-caption text-green' : 't-caption text-red'}>
              {trend.positive ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        <div className="text-fg-3">{icon}</div>
      </div>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Bewerbungen"
        value="12"
        trend={{ value: 8, positive: true }}
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2h8v12H4z" />
            <path d="M6 6h4M6 8h4M6 10h2" />
          </svg>
        }
      />
      <StatCard
        label="Matches"
        value="24"
        trend={{ value: 12, positive: true }}
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
      <StatCard
        label="Profile abgeschlossen"
        value="85%"
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="5" />
            <path d="M8 5v3l2 2" strokeLinecap="round" />
          </svg>
        }
      />
      <StatCard
        label="Dokumente"
        value="5"
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2h6l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
            <path d="M9 2v4h4" />
          </svg>
        }
      />
    </div>
  );
}
