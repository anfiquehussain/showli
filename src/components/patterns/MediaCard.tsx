import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbMedia } from '@/types/tmdb.types';
import { useAddToCollection } from '@/hooks/useAddToCollection';

interface MediaCardProps {
  item: TmdbMedia;
  onAddClick?: (e: React.MouseEvent, item: TmdbMedia) => void;
}

export const MediaCard = ({ item, onAddClick }: MediaCardProps) => {
  const { openAddToCollection } = useAddToCollection();
  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date?.split('-')[0] || 'N/A';
  const type = 'title' in item ? 'movie' : 'tv';

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddClick) {
      onAddClick(e, item);
    } else {
      openAddToCollection(item);
    }
  };

  return (
    <Link 
      to={`/${type}/${item.id}`}
      className="block shrink-0"
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="w-36 md:w-40 space-y-2 group/card snap-start"
      >
        <div className="relative aspect-2/3 rounded-xl overflow-hidden glass-card transition-standard border-white/5 hover:border-brand-secondary/50 shadow-lg">
          <img
            src={getTmdbImageUrl(item.poster_path, 'w342')}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-background/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-bold text-warning shadow-lg">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{item.vote_average?.toFixed(1) || '0.0'}</span>
          </div>

          {/* Add to Collection Button (Responsive: always visible on mobile, hover-only on desktop) */}
          <button
            onClick={handleAddClick}
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-background/60 hover:bg-brand-primary hover:text-white text-brand-primary backdrop-blur-md border border-white/10 transition-colors duration-300 shadow-lg z-10 scale-100 active:scale-90 opacity-100 md:opacity-0 md:group-hover/card:opacity-100"
            aria-label="Add to collection"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-tighter">
              {year}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium text-primary truncate px-1">
          {title}
        </h3>
      </motion.div>
    </Link>
  );
};

export default MediaCard;
