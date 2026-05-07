import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, LayoutGrid, Columns2, Edit2, Trash2, Plus, Dices, ExternalLink, Sparkles } from 'lucide-react';
import type { Collection, CollectionMovie, MovieStatus } from '@/types/collections.types';
import { getTmdbImageUrl } from '@/utils/image';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/patterns/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateCollectionMovieStatusMutation } from '@/api/collections/collectionsApi';
import Modal from '@/components/patterns/Modal';

interface CollectionDetailsProps {
  collection: Collection;
  movies: CollectionMovie[];
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedia?: () => void;
  onRemoveMovie: (tmdbId: number) => void;
}

export const CollectionDetails = ({
  collection,
  movies,
  isLoading,
  onEdit,
  onDelete,
  onAddMedia,
  onRemoveMovie
}: CollectionDetailsProps) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<MovieStatus | 'all'>('all');
  const [randomMovie, setRandomMovie] = useState<CollectionMovie | null>(null);

  const handleRandomPick = () => {
    if (filteredMovies.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    setRandomMovie(filteredMovies[randomIndex] || null);
  };

  const filteredMovies = filterStatus === 'all' 
    ? movies 
    : movies.filter(m => m.status === filterStatus);

  const statusFilters: { value: MovieStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'planned', label: 'Planned' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Watched' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 glass-card p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ backgroundColor: collection.color || 'var(--color-brand-primary)' }}
          >
            <Folder className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">{collection.name}</h1>
            {collection.description && (
              <p className="text-sm text-text-secondary max-w-2xl">{collection.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-text-secondary font-medium mt-2">
              <span>{movies.length} items</span>
              {filteredMovies.length !== movies.length && (
                <span className="text-brand-primary">• {filteredMovies.length} filtered</span>
              )}
              <span>•</span>
              <span className="capitalize">{collection.visibility}</span>
              <span>•</span>
              <span>Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          {onAddMedia && (
            <Button
              onClick={onAddMedia}
              size="sm"
              variant="primary"
              className="rounded-xl h-10 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Media</span>
            </Button>
          )}
          <IconButton
            icon={Edit2}
            onClick={onEdit}
            variant="secondary"
            aria-label="Edit Collection"
          />
          {!collection.is_default && (
            <IconButton
              icon={Trash2}
              onClick={onDelete}
              variant="secondary"
              className="text-error hover:bg-error/10 hover:border-error/20"
              aria-label="Delete Collection"
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${filterStatus === filter.value
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'}
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {filteredMovies.length > 0 && (
            <Button
              onClick={handleRandomPick}
              variant="secondary"
              size="sm"
              className="rounded-xl h-9 px-3 flex items-center gap-2 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20"
            >
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">Pick Random</span>
            </Button>
          )}
          <div className="flex items-center gap-1 glass-card p-1 rounded-xl self-end sm:self-auto">
          <IconButton
            icon={LayoutGrid}
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            className="w-8 h-8 p-1.5"
            aria-label="Grid view"
          />
          <IconButton
            icon={Columns2}
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            className="w-8 h-8 p-1.5"
            aria-label="List view"
          />
        </div>
      </div>
    </div>

    {/* Content */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`bg-card/50 animate-pulse rounded-xl ${viewMode === 'grid' ? 'aspect-[2/3]' : 'h-24'}`} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">This collection is empty</h3>
          <p className="text-text-secondary text-sm">Add movies or TV shows to see them here.</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-text-secondary text-sm">No items matching the selected filter.</p>
          <button 
            onClick={() => setFilterStatus('all')}
            className="mt-4 text-brand-primary text-sm font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
          {filteredMovies.map((movie) => (
            <CollectionMovieCard 
              key={movie.tmdb_id} 
              movie={movie} 
              collectionId={collection.id}
              viewMode={viewMode}
              onRemove={() => onRemoveMovie(movie.tmdb_id)}
            />
          ))}
        </div>
      )}

      {/* Random Pick Modal */}
      <Modal
        isOpen={!!randomMovie}
        onClose={() => setRandomMovie(null)}
        title="Lucky Pick"
      >
        {randomMovie && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative aspect-[2/3] w-48 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <img 
                    src={getTmdbImageUrl(randomMovie.poster_path, 'w500')} 
                    alt={randomMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <StatusBadge status={randomMovie.status || 'planned'} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-warning" />
                  <h3 className="text-xl font-bold text-primary">{randomMovie.title}</h3>
                  <Sparkles className="w-4 h-4 text-warning" />
                </div>
                <p className="text-sm text-text-secondary">
                  {new Date(randomMovie.release_date).getFullYear()} • {randomMovie.vote_average.toFixed(1)} Rating
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                onClick={() => {
                  navigate(`/details/${randomMovie.media_type}/${randomMovie.tmdb_id}`);
                  setRandomMovie(null);
                }}
              >
                <ExternalLink className="w-4 h-4" />
                View Details
              </Button>
              <Button
                variant="secondary"
                className="w-full py-3 rounded-2xl"
                onClick={handleRandomPick}
              >
                Pick Again
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const CollectionMovieCard = ({ 
  movie, 
  collectionId,
  viewMode, 
  onRemove 
}: { 
  movie: CollectionMovie, 
  collectionId: string,
  viewMode: 'grid' | 'list', 
  onRemove: () => void 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [updateStatus] = useUpdateCollectionMovieStatusMutation();

  const handleStatusChange = async (newStatus: MovieStatus) => {
    if (!user) return;
    try {
      await updateStatus({
        uid: user.uid,
        collectionId,
        tmdbId: movie.tmdb_id,
        status: newStatus
      }).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusOptions: { value: MovieStatus; label: string }[] = [
    { value: 'planned', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Watched' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  if (viewMode === 'grid') {
    return (
      <div 
        className="relative group rounded-xl overflow-hidden glass-card aspect-[2/3] cursor-pointer"
        onClick={() => navigate(`/${movie.media_type}/${movie.tmdb_id}`)}
      >
        {movie.poster_path ? (
          <img 
            src={getTmdbImageUrl(movie.poster_path, 'w342')} 
            alt={movie.title || `Media ${movie.tmdb_id}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-card/50 flex items-center justify-center p-4 text-center text-xs">
            {movie.title || `ID: ${movie.tmdb_id}`}
          </div>
        )}
        
        {/* Status Badge - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <StatusBadge status={movie.status || 'planned'} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-20">
          <div className="flex justify-end">
             <IconButton
                icon={Trash2}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                variant="primary"
                className="bg-error/80 hover:bg-error w-8 h-8 p-1.5"
                aria-label="Remove from collection"
              />
          </div>
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-white truncate">{movie.title || 'Unknown'}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {movie.vote_average > 0 && (
                  <span className="text-xs font-medium text-warning flex items-center gap-1">
                    ★ {movie.vote_average.toFixed(1)}
                  </span>
                )}
                {movie.release_date && <span className="text-xs text-white/70">{movie.release_date.split('-')[0]}</span>}
              </div>
            </div>

            {/* Status Select */}
            <div className="relative z-30">
              <select
                value={movie.status || 'planned'}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStatusChange(e.target.value as MovieStatus);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-4 p-3 glass-card rounded-xl group relative cursor-pointer"
      onClick={() => navigate(`/${movie.media_type}/${movie.tmdb_id}`)}
    >
      <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-card/50">
        {movie.poster_path ? (
          <img 
            src={getTmdbImageUrl(movie.poster_path, 'w185')} 
            alt={movie.title || 'Poster'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-medium text-primary truncate">{movie.title || `Media ID: ${movie.tmdb_id}`}</h3>
          <StatusBadge status={movie.status || 'planned'} />
        </div>
        {movie.release_date && <p className="text-sm text-text-secondary">{movie.release_date.split('-')[0]}</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {movie.vote_average > 0 && (
              <span className="text-xs font-medium text-warning">★ {movie.vote_average.toFixed(1)}</span>
            )}
            <p className="text-xs text-text-secondary">Added {new Date(movie.added_at).toLocaleDateString()}</p>
          </div>
          
          <div className="relative z-20 min-w-[120px]">
            <select
              value={movie.status || 'planned'}
              onChange={(e) => {
                e.stopPropagation();
                handleStatusChange(e.target.value as MovieStatus);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-medium text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="relative z-20 px-2">
        <IconButton
          icon={Trash2}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          variant="ghost"
          className="text-text-secondary hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100"
          aria-label="Remove from collection"
        />
      </div>
    </div>
  );
};

export default CollectionDetails;
