import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateCollectionMediaStatusMutation } from '@/api/collections/collectionsApi';
import IconButton from '@/components/ui/IconButton';
import StatusBadge from '@/components/patterns/StatusBadge';
import type { CollectionMedia, MediaStatus } from '@/types/collections.types';

interface CollectionMediaCardProps {
  item: CollectionMedia;
  collectionId: string;
  viewMode: 'grid' | 'list';
  onRemove: () => void;
}

const CollectionMediaCard = ({ 
  item, 
  collectionId,
  viewMode, 
  onRemove 
}: CollectionMediaCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [updateStatus] = useUpdateCollectionMediaStatusMutation();

  const handleStatusChange = async (newStatus: MediaStatus) => {
    if (!user) return;
    try {
      await updateStatus({
        uid: user.uid,
        collectionId,
        tmdbId: item.tmdb_id,
        status: newStatus
      }).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusOptions: { value: MediaStatus; label: string }[] = [
    { value: 'planned', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Watched' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  if (viewMode === 'grid') {
    return (
      <div 
        className="relative group rounded-xl overflow-hidden glass-card aspect-2/3 cursor-pointer"
        onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
      >
        {item.poster_path ? (
          <img 
            src={getTmdbImageUrl(item.poster_path, 'w342')} 
            alt={item.title || `Media ${item.tmdb_id}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-card/50 flex items-center justify-center p-4 text-center text-xs">
            {item.title || `ID: ${item.tmdb_id}`}
          </div>
        )}
        
        <div className="absolute top-2 left-2 z-10 hidden md:block">
          <StatusBadge status={item.status || 'planned'} />
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-20">
          <div className="flex justify-end">
             <IconButton
                icon={Trash2}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                variant="primary"
                className="bg-error/80 hover:bg-error w-7 h-7 md:w-8 md:h-8 p-1 md:p-1.5"
                aria-label="Remove from collection"
              />
          </div>
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-white truncate">{item.title || 'Unknown'}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {item.vote_average > 0 && (
                  <span className="text-xs font-medium text-warning flex items-center gap-1">
                    ★ {item.vote_average.toFixed(1)}
                  </span>
                )}
                {item.release_date && <span className="text-xs text-white/70">{item.release_date.split('-')[0]}</span>}
              </div>
            </div>

            <div className="relative z-30">
              <select
                value={item.status || 'planned'}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStatusChange(e.target.value as MediaStatus);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-white">
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
      onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
    >
      <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-card/50">
        {item.poster_path ? (
          <img 
            src={getTmdbImageUrl(item.poster_path, 'w185')} 
            alt={item.title || 'Poster'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-medium text-primary truncate">{item.title || `Media ID: ${item.tmdb_id}`}</h3>
          <StatusBadge status={item.status || 'planned'} />
        </div>
        {item.release_date && <p className="text-sm text-text-secondary">{item.release_date.split('-')[0]}</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {item.vote_average > 0 && (
              <span className="text-xs font-medium text-warning">★ {item.vote_average.toFixed(1)}</span>
            )}
            <p className="text-xs text-text-secondary">Added {new Date(item.added_at).toLocaleDateString()}</p>
          </div>
          
          <div className="relative z-20 min-w-[120px]">
            <select
              value={item.status || 'planned'}
              onChange={(e) => {
                e.stopPropagation();
                handleStatusChange(e.target.value as MediaStatus);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-medium text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-white">
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
          className="text-text-secondary hover:text-error hover:bg-error/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 w-8 h-8 p-1.5 md:w-9 md:h-9 md:p-2"
          aria-label="Remove from collection"
        />
      </div>
    </div>
  );
};

export default CollectionMediaCard;
