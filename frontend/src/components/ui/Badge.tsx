import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'info', className, children }: BadgeProps) {
  return (
    <span className={cn('bp-badge', `bp-badge--${variant}`, className)}>
      {children}
    </span>
  );
}
