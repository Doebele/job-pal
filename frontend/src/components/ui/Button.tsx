import { cn } from '../../lib/utils';
import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bp-btn-primary',
    secondary: 'bp-btn-secondary',
    ghost: 'bp-btn-ghost',
    danger: 'bp-btn-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-t-body-sm',
    md: 'px-4 py-2 text-t-body',
    lg: 'px-6 py-3 text-t-h3',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  );
}
