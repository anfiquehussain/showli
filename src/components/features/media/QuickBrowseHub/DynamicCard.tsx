import { motion } from 'framer-motion';
import { useDiscoverQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

interface DynamicCardProps {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  logoPath?: string;
  pillLabel?: string;
  flagEmoji?: string;
  discoverParams: Record<string, string | number>;
  onClick: () => void;
  color?: string;
}

export const DynamicCard = ({ 
  name, 
  icon: Icon, 
  logoPath, 
  pillLabel, 
  flagEmoji, 
  discoverParams, 
  onClick, 
  color = 'bg-brand-primary/10 text-brand-primary' 
}: DynamicCardProps) => {
  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: {
      ...discoverParams,
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const featuredMovie = data?.results?.[0];
  const backdropUrl = getTmdbImageUrl(featuredMovie?.backdrop_path, 'w500');
  const movieTitle = featuredMovie
    ? ('title' in featuredMovie ? featuredMovie.title : ('name' in featuredMovie ? featuredMovie.name : ''))
    : '';

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-4 h-28 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors overflow-hidden group shrink-0 w-36 sm:w-44 text-center bg-card/20 cursor-pointer"
    >
      {/* Background Image with overlay */}
      {isLoading ? (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      ) : backdropUrl ? (
        <>
          <img
            src={backdropUrl}
            alt={movieTitle || name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-20 group-hover:opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/50 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 opacity-5 ${color.split(' ')[0]}`} />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {logoPath ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden mb-1.5 border border-white/10 group-hover:border-brand-primary/30 transition-colors bg-black/40 p-1 flex items-center justify-center">
            <img 
              src={`https://image.tmdb.org/t/p/w92${logoPath}`}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : flagEmoji ? (
          <span className="text-2xl mb-1.5 select-none leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {flagEmoji}
          </span>
        ) : pillLabel ? (
          <div className="px-2 py-0.5 rounded-lg bg-brand-primary/20 text-brand-primary text-[10px] font-black tracking-widest mb-2 border border-brand-primary/30">
            {pillLabel}
          </div>
        ) : Icon ? (
          <div className={`p-2 rounded-xl mb-1.5 transition-colors duration-300 group-hover:bg-brand-primary/20 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}

        <span className="text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-brand-primary transition-colors">
          {name}
        </span>
        {movieTitle && (
          <span className="text-[9px] text-muted-foreground mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {movieTitle}
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default DynamicCard;
