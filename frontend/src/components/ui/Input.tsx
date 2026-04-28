import { cn } from '../../lib/utils';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

interface InputProps extends Omit<ComponentProps<'input'>, 'ref'> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="eyebrow mb-1.5 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'bp-input',
            error && 'border-red !ring-1 !ring-red',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-t-caption text-red">{error}</p>}
        {helper && !error && <p className="mt-1 text-t-caption text-fg-3">{helper}</p>}
      </div>
    );
  }
);
