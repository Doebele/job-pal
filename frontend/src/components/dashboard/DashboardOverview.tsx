import { QuickStats } from './QuickStats';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="t-h1 text-fg-1 mb-1">Dashboard</h1>
        <p className="t-body text-fg-2">Willkommen zurück! Hier ist dein Überblick.</p>
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="t-h2 text-fg-1">Empfohlene Jobs</h3>
              <Link to="/jobs">
                <Button variant="ghost" size="sm">Alle anzeigen</Button>
              </Link>
            </div>
          }
        >
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="t-body-sm text-fg-1">Job-Titel {i}</p>
                  <p className="t-caption text-fg-3">Zürich</p>
                </div>
                <span className="t-num text-green">85%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="t-h2 text-fg-1">Deine Bewerbungen</h3>
              <Link to="/applications">
                <Button variant="ghost" size="sm">Alle anzeigen</Button>
              </Link>
            </div>
          }
        >
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="t-body-sm text-fg-1">Bewerbung {i}</p>
                  <p className="t-caption text-fg-3">Vor {i} Tag(en)</p>
                </div>
                <span className="bp-badge bp-badge--info t-num-sm">
                  {i === 1 ? 'In Prüfung' : 'Eingegangen'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
