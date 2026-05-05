import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Mein Profil', path: '/profile', icon: 'profile' },
  { label: 'Job-Liste', path: '/jobs', icon: 'jobs' },
  { label: 'Meine Inserate', path: '/my-jobs', icon: 'jobs', roles: ['employer'] },
  { label: 'Neues Inserat', path: '/jobs/new', icon: 'jobs', roles: ['employer'] },
  { label: 'Bewerbungen', path: '/applications', icon: 'applications', roles: ['student'] },
  { label: 'Gespeicherte Jobs', path: '/saved-jobs', icon: 'bookmark', roles: ['student'] },
  { label: 'Einstellungen', path: '/settings', icon: 'settings' },
];

interface SidebarProps {
  role: string;
  isCollapsed?: boolean;
}

export function Sidebar({ role, isCollapsed = false }: SidebarProps) {
  const location = useLocation();

  const filteredNav = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside
      className={cn(
        'flex flex-col bg-surface border-r border-border transition-all',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
            <span className="t-h3 text-white font-bold">J</span>
          </div>
          {!isCollapsed && <span className="t-h2 text-fg-1">Job-Pal</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-base text-t-body-sm transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-fg-3 hover:text-fg-1 hover:bg-surface-2'
              )}
            >
              <Icon name={item.icon} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className={cn('t-caption text-fg-3', isCollapsed && 'hidden')}>
          Job-Pal v1.0
        </p>
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.JSX.Element> = {
    dashboard: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="5" height="5" rx="1" />
        <rect x="10" y="1" width="5" height="5" rx="1" />
        <rect x="1" y="10" width="5" height="5" rx="1" />
        <rect x="10" y="10" width="5" height="5" rx="1" />
      </svg>
    ),
    profile: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="6" r="3" />
        <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    ),
    jobs: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="10" rx="1" />
        <path d="M6 7h4M6 9h2" />
      </svg>
    ),
    applications: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h8v12H4z" />
        <path d="M6 5h4M6 7h4M6 9h2" />
      </svg>
    ),
    bookmark: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h8v12l-4-3-4 3V2z" />
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
      </svg>
    ),
  };
  return icons[name] || null;
}
