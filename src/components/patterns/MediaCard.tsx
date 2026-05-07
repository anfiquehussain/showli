import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbMedia } from '@/types/tmdb.types';

interface MediaCardProps {
  item: TmdbMedia;
  onAddClick?: (e: React.MouseEvent, item: TmdbMedia) => void;
}

export const MediaCard = ({ item, onAddClick }: MediaCardProps) => {
  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date?.split('-')[0] || 'N/A';
  const type = 'title' in item ? 'movie' : 'tv';

  return (
    <Link 
      to={`/${type}/${item.id}`}
      className="block flex-shrink-0"
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="w-28 md:w-40 space-y-2 group/card snap-start"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card transition-standard border-white/5 hover:border-brand-secondary/50 shadow-lg">
          <img
            src={getTmdbImageUrl(item.poster_path, 'w342')}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            loading="lazy"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-background/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-bold text-warning shadow-lg">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
            <div className="flex justify-start">
              {onAddClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddClick(e, item);
                  }}
                  className="p-1.5 rounded-full bg-brand-primary/80 hover:bg-brand-primary text-white backdrop-blur-md transition-colors"
                  aria-label="Add to collection"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
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
