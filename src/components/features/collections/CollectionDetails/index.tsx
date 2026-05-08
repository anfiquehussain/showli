import { useState, useMemo } from 'react';
import { Folder } from 'lucide-react';
import type { Collection, CollectionMedia, MediaStatus } from '@/types/collections.types';

// Internal Components
import CollectionDetailsHeader from './CollectionDetailsHeader';
import CollectionDetailsToolbar from './CollectionDetailsToolbar';
import CollectionMediaCard from './CollectionMediaCard';
import RandomPickModal from './RandomPickModal';

interface CollectionDetailsProps {
  collection: Collection;
  mediaItems: CollectionMedia[];
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedia?: () => void;
  onRemoveMedia: (tmdbId: number) => void;
}

export const CollectionDetails = ({
  collection,
  mediaItems,
  isLoading,
  onEdit,
  onDelete,
  onAddMedia,
  onRemoveMedia
}: CollectionDetailsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [randomMedia, setRandomMedia] = useState<CollectionMedia | null>(null);

  const filteredMedia = useMemo<CollectionMedia[]>(() => {
    return mediaItems
      .filter(m => {
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        const matchesSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      });
  }, [mediaItems, filterStatus, searchQuery]);

  const handleRandomPick = () => {
    if (filteredMedia.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredMedia.length);
    setRandomMedia(filteredMedia[randomIndex] || null);
  };

  return (
    <div className="space-y-6">
      <CollectionDetailsHeader 
        collection={collection}
        mediaItems={mediaItems}
        filteredMediaCount={filteredMedia.length}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddMedia={onAddMedia}
      />

      <CollectionDetailsToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRandomPick={handleRandomPick}
        showRandomPick={filteredMedia.length > 0}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`bg-card/50 animate-pulse rounded-xl ${viewMode === 'grid' ? 'aspect-[2/3]' : 'h-24'}`} />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">This collection is empty</h3>
          <p className="text-text-secondary text-sm">Add movies or TV shows to see them here.</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <p className="text-text-secondary text-sm">
            {searchQuery 
              ? `No items matching "${searchQuery}"${filterStatus !== 'all' ? ` in ${filterStatus} status` : ''}` 
              : 'No items matching the selected filter.'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="text-brand-primary text-sm font-medium hover:underline"
              >
                Clear status filter
              </button>
            )}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-brand-primary text-sm font-medium hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
          {filteredMedia.map((item) => (
            <CollectionMediaCard 
              key={item.tmdb_id} 
              item={item} 
              collectionId={collection.id}
              viewMode={viewMode}
              onRemove={() => onRemoveMedia(item.tmdb_id)}
            />
          ))}
        </div>
      )}

      <RandomPickModal 
        media={randomMedia}
        onClose={() => setRandomMedia(null)}
        onPickAgain={handleRandomPick}
      />
    </div>
  );
};

export default CollectionDetails;
