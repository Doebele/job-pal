import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../stores/auth-store';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

export function Layout({ children, showSearch = false }: LayoutProps) {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={user?.role || 'student'} isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearch={showSearch ? () => {} : undefined}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
