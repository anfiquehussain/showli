import { Star } from 'lucide-react';

interface RatingProps {
  value: number; // 0-10
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Rating = ({ 
  value, 
  max = 10, 
  className = '', 
  size = 'sm' 
}: RatingProps) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      bg-brand-primary/10 text-brand-primary
      border border-brand-primary/20
      rounded-full font-bold
      ${sizes[size]}
      ${className}
    `}>
      <Star className={`${iconSizes[size]} fill-current`} />
      <div className="flex items-baseline gap-0.5">
        <span>{value.toFixed(1)}</span>
        <span className="text-[0.8em] opacity-50 font-medium">/ {max}</span>
      </div>
    </div>
  );
};

export default Rating;
