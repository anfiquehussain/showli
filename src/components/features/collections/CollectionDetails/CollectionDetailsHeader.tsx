import { Folder, Edit2, Trash2, Plus } from 'lucide-react';
import type { Collection, CollectionMedia } from '@/types/collections.types';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';

interface CollectionDetailsHeaderProps {
  collection: Collection;
  mediaItems: CollectionMedia[];
  filteredMediaCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddMedia?: () => void;
}

const CollectionDetailsHeader = ({
  collection,
  mediaItems,
  filteredMediaCount,
  onEdit,
  onDelete,
  onAddMedia
}: CollectionDetailsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 glass-card p-4 sm:p-6 rounded-2xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <div 
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ backgroundColor: collection.color || 'var(--color-brand-primary)' }}
        >
          <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">{collection.name}</h1>
          {collection.description && (
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl line-clamp-2">{collection.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-text-secondary font-medium mt-1 sm:mt-2">
            <span>{mediaItems.length} items</span>
            {filteredMediaCount !== mediaItems.length && (
              <span className="text-brand-primary">• {filteredMediaCount} filtered</span>
            )}
            <span>•</span>
            <span className="capitalize">{collection.visibility}</span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline">Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-start">
        {onAddMedia && (
          <Button
            onClick={onAddMedia}
            size="sm"
            variant="primary"
            className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Add Media</span>
          </Button>
        )}
        <IconButton
          icon={Edit2}
          onClick={onEdit}
          variant="secondary"
          aria-label="Edit Collection"
          className="w-9 h-9 sm:w-10 sm:h-10"
        />
        {!collection.is_default && (
          <IconButton
            icon={Trash2}
            onClick={onDelete}
            variant="secondary"
            className="text-error hover:bg-error/10 hover:border-error/20 w-9 h-9 sm:w-10 sm:h-10"
            aria-label="Delete Collection"
          />
        )}
      </div>
    </div>
  );
};

export default CollectionDetailsHeader;
