import type { ReactNode } from 'react';
import type { TmdbMedia } from '@/types/tmdb.types';
import { MediaCard } from './MediaCard';
import ScrollContainer from './ScrollContainer';

interface MediaScrollProps {
  title: string;
  icon: ReactNode;
  items: TmdbMedia[];
  isLoading?: boolean;
  onAddClick?: (e: React.MouseEvent, item: TmdbMedia) => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

const MediaScroll = ({ title, icon, items, isLoading, onAddClick, onViewAll, viewAllLabel = 'View All' }: MediaScrollProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 h-6 w-32 bg-card/50 animate-pulse rounded" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-28 md:w-40 aspect-[2/3] bg-card/50 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 py-4 group/section">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-brand-secondary font-medium text-sm uppercase tracking-wider">
          {icon}
          <span>{title}</span>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
          >
            {viewAllLabel}
          </button>
        )}
      </div>
      
      <ScrollContainer className="gap-4 pb-4">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <MediaCard item={item} onAddClick={onAddClick} />
          </div>
        ))}
      </ScrollContainer>
    </div>
  );
};

export default MediaScroll;
