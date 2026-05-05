import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string | null;
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6 text-t-body-sm',
  md: 'w-10 h-10 text-t-body',
  lg: 'w-14 h-14 text-t-h2',
};

export function Avatar({ name, size = 'md', src, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold bg-accent/20 text-accent',
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
