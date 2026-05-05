import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
      {/* Search */}
      {onSearch && (
        <div className="relative flex-1 max-w-md">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-3"
          >
            <circle cx="7" cy="7" r="4" />
            <path d="M10 10l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Suchen..."
            className="bp-input pl-9 w-full max-w-md"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 hover:bg-surface-2 rounded-base px-2 py-1 transition-colors"
        >
          <Avatar
            name={`${user?.email?.[0] || 'U'} ${user?.email?.split('@')[0] || ''}`}
            size="sm"
          />
          <span className="t-body-sm text-fg-2 hidden sm:inline">
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-2 w-48 bp-card shadow-modal z-20">
              <div className="p-3 border-b border-border">
                <p className="t-body text-fg-1">{user?.email}</p>
                <p className="t-caption text-fg-3 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 t-body-sm text-fg-2 hover:text-red hover:bg-surface-2 transition-colors"
              >
                Abmelden
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
