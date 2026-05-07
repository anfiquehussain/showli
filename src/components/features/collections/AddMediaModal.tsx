import { useState, useEffect } from 'react';
import { Search, Plus, Film, Star, Loader2, Check } from 'lucide-react';
import { useSearchMediaQuery } from '@/api/tmdb/tmdbApi';
import { useAuth } from '@/hooks/useAuth';
import { useAddMovieToCollectionMutation, useRemoveMovieFromCollectionMutation, useGetCollectionMoviesQuery } from '@/api/collections/collectionsApi';
import { getTmdbImageUrl } from '@/utils/image';
import Modal from '@/components/patterns/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import type { Collection } from '@/types/collections.types';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
}

const AddMediaModal = ({ isOpen, onClose, collection }: AddMediaModalProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addMovie] = useAddMovieToCollectionMutation();
  const [removeMovie] = useRemoveMovieFromCollectionMutation();

  // Get current movies in this collection to show "Added" status
  const { data: currentMovies = [] } = useGetCollectionMoviesQuery(
    { uid: user?.uid || '', collectionId: collection.id },
    { skip: !user || !isOpen || collection.is_all_media }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearchMediaQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const handleToggleMedia = async (media: any) => {
    if (!user?.uid) return;
    
    const isAdded = currentMovies.some(m => m.tmdb_id === media.id);

    try {
      if (isAdded) {
        await removeMovie({ uid: user.uid, collectionId: collection.id, tmdbId: media.id }).unwrap();
        success('Removed from collection');
      } else {
        const type = 'title' in media ? 'movie' : 'tv';
        const title = 'title' in media ? media.title : media.name;
        const release_date = 'release_date' in media ? media.release_date : media.first_air_date;

        await addMovie({
          uid: user.uid,
          collectionId: collection.id,
          movie: { 
            tmdb_id: media.id, 
            media_type: type,
            title,
            poster_path: media.poster_path,
            release_date: release_date || '',
            vote_average: media.vote_average
          }
        }).unwrap();
        success('Added to collection');
      }
    } catch (err) {
      error('Failed to update collection');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add to ${collection.name}`}
    >
      <div className="space-y-6">
        <div className="relative">
          <Input
            placeholder="Search movies or shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl"
            autoFocus
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
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
                const isAdded = currentMovies.some(m => m.tmdb_id === item.id);
                
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${
                      isAdded 
                        ? 'bg-brand-primary/5 border-brand-primary/20' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-18 rounded-lg bg-card overflow-hidden flex-shrink-0 shadow-md">
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
                      <h4 className="font-bold text-sm text-primary truncate">{title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary uppercase font-bold tracking-wider">
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
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                        isAdded ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' : ''
                      }`}
                      onClick={() => handleToggleMedia(item)}
                    >
                      {isAdded ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </div>
                      )}
                    </Button>
                  </div>
                );
              })
          ) : debouncedQuery.length >= 2 ? (
            <div className="text-center py-12 text-text-secondary glass-card rounded-2xl">
              <p>No results found for "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary space-y-3 glass-card rounded-2xl">
              <Plus className="w-10 h-10 mx-auto opacity-20" />
              <p className="text-sm font-medium">Type at least 2 characters to search movies</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddMediaModal;
