import { cn } from '../../lib/utils';
import type { ComponentProps, ReactNode } from 'react';

interface CardProps extends ComponentProps<'div'> {
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ header, footer, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bp-card', className)}
      {...props}
    >
      {header && <div className="mb-4">{header}</div>}
      {children && <div className="mb-4">{children}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
