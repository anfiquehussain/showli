import { Folder, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGetCollectionMediaQuery } from '@/api/collections/collectionsApi';
import type { Collection } from '@/types/collections.types';

interface CollectionItemProps {
  collection: Collection;
  mediaId: number;
  onToggle: (isAdded: boolean) => void;
}

const CollectionItem = ({ 
  collection, 
  mediaId,
  onToggle
}: CollectionItemProps) => {
  const { user } = useAuth();
  const { data: mediaItems = [], isFetching } = useGetCollectionMediaQuery({ uid: user?.uid || '', collectionId: collection.id }, {
    skip: !user
  });
  
  const isAdded = mediaItems.some(m => m.tmdb_id === mediaId);

  return (
    <button
      onClick={() => onToggle(isAdded)}
      disabled={isFetching}
      className={`
        w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left
        ${isAdded ? 'bg-brand-primary/10 border border-brand-primary/30' : 'glass-card hover:bg-white/5'}
        ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: collection.color || 'var(--brand-primary)' }}
        >
          <Folder className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-primary">{collection.name}</span>
          <span className="text-[10px] text-text-secondary leading-none">
            {collection.media_count || 0} {collection.media_count === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
      
      {isAdded && (
        <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};

export default CollectionItem;
