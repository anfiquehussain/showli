import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProfileSection from './ProfileSection';
import type { TmdbMedia } from '@/types/tmdb.types';
import { getTmdbImageUrl } from '@/utils/image';

interface ProfileFavoritesProps {
  favorites: TmdbMedia[];
  onAdd: () => void;
  onRemove: (id: number) => void;
}

const ProfileFavorites = ({ favorites, onAdd, onRemove }: ProfileFavoritesProps) => {
  return (
    <ProfileSection 
      title="Top 5 Favorites" 
      icon={<Heart className="w-4 h-4" />}
      action={
        <Button 
          size="sm" 
          variant="secondary" 
          className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-wider gap-1.5 px-2.5"
          onClick={onAdd}
          disabled={favorites.length >= 5}
        >
          <Plus className="w-3 h-3" />
          Add Media
        </Button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 justify-items-center">
        <AnimatePresence mode="popLayout">
          {favorites.map((movie, index) => {
            const title = 'title' in movie ? movie.title : movie.name;
            return (
              <motion.div 
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="group relative aspect-2/3 w-full max-w-[120px] sm:max-w-[130px] md:max-w-[140px] rounded-xl overflow-hidden glass-card transition-standard hover:border-brand-primary/50 shadow-xl"
              >
                <img 
                  src={getTmdbImageUrl(movie.poster_path, 'w342')} 
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-standard duration-700"
                />
                
                {/* Ranking Badge */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {index + 1}
                </div>
 
                {/* Remove Button */}
                <button 
                  onClick={() => onRemove(movie.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-error/20 backdrop-blur-md border border-error/20 text-error opacity-0 group-hover:opacity-100 transition-standard hover:bg-error hover:text-white"
                  aria-label="Remove from favorites"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
                  <p className="text-xs font-bold text-white truncate">{title}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty Slots */}
        {Array.from({ length: 5 - favorites.length }).map((_, i) => (
          <div 
            key={`empty-${i}`}
            className="aspect-2/3 w-full max-w-[120px] sm:max-w-[130px] md:max-w-[140px] rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-white/5 hover:border-white/10 transition-standard cursor-pointer"
            onClick={onAdd}
          >
            <Plus className="w-5 h-5 opacity-20" />
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Empty</span>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
};

export default ProfileFavorites;
