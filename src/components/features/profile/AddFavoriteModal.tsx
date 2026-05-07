import { useState, useEffect } from 'react';
import { Search, Plus, Film, Star, Loader2 } from 'lucide-react';

import { useSearchMediaQuery } from '@/api/tmdb/tmdbApi';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useAuth } from '@/hooks/useAuth';
import { addUserFavorite } from '@/store/slices/profileSlice';
import { getTmdbImageUrl } from '@/utils/image';
import Modal from '@/components/patterns/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFavoriteModal = ({ isOpen, onClose }: AddFavoriteModalProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { favorites, isLoading: isAdding } = useAppSelector(state => state.profile);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearchMediaQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const handleAdd = async (movie: any) => {
    if (favorites.length >= 5 || !user?.uid) return;
    
    try {
      await dispatch(addUserFavorite({ uid: user.uid, movie })).unwrap();
      if (favorites.length + 1 === 5) onClose();
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Favorites"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select a movie or show to add to your top 5. ({favorites.length}/5)
        </p>
        <div className="relative">
          <Input
            placeholder="Search movies or shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <p>Searching TMDb...</p>
            </div>
          ) : data?.results && data.results.length > 0 ? (
            data.results
              .filter(m => m.media_type === 'movie' || m.media_type === 'tv')
              .map((item) => {
                const title = 'title' in item ? item.title : item.name;
                const isAdded = favorites.some(f => f.id === item.id);
                
                return (
                  <div 
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-standard"
                  >
                    <div className="w-12 h-18 rounded-lg bg-card overflow-hidden flex-shrink-0">
                      {item.poster_path ? (
                        <img 
                          src={getTmdbImageUrl(item.poster_path, 'w92')} 
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                        <span className="text-brand-secondary">{item.media_type}</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-warning text-warning" />
                          {item.vote_average.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'primary'}
                      className="h-8 px-3 rounded-lg text-xs"
                      disabled={isAdded || favorites.length >= 5 || isAdding}
                      onClick={() => handleAdd(item)}
                    >
                      {isAdded ? 'Added' : favorites.length >= 5 ? 'Full' : (isAdding ? 'Adding...' : 'Add')}
                    </Button>
                  </div>
                );
              })
          ) : debouncedQuery.length >= 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No results found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Plus className="w-8 h-8 mx-auto opacity-20" />
              <p>Type at least 2 characters to search</p>
            </div>
          )}
        </div>

        {favorites.length >= 5 && (
          <p className="text-xs text-warning text-center bg-warning/10 p-3 rounded-xl border border-warning/20">
            You've reached the maximum of 5 favorites. Remove one to add another.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AddFavoriteModal;
