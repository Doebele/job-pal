import { cn } from '../../lib/utils';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<ComponentProps<'select'>, 'ref'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="eyebrow mb-1.5 block">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'bp-input appearance-none cursor-pointer',
            error && 'border-red !ring-1 !ring-red',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-t-caption text-red">{error}</p>}
      </div>
    );
  }
);
