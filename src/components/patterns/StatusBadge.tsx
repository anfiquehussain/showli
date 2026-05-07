import type { MovieStatus } from '@/types/collections.types';

interface StatusBadgeProps {
  status: MovieStatus;
  className?: string;
}

const statusConfig: Record<MovieStatus, { label: string; colorClass: string }> = {
  planned: { label: 'Planned', colorClass: 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' },
  watching: { label: 'Watching', colorClass: 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30' },
  completed: { label: 'Completed', colorClass: 'bg-success/20 text-success border border-success/30' },
  on_hold: { label: 'On Hold', colorClass: 'bg-warning/20 text-warning border border-warning/30' },
  dropped: { label: 'Dropped', colorClass: 'bg-error/20 text-error border border-error/30' },
  rewatching: { label: 'Rewatching', colorClass: 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' },
};

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.colorClass} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
