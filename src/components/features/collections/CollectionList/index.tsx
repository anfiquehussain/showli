import { useState, useMemo } from 'react';
import { Plus, Folder, LayoutGrid, Columns2 } from 'lucide-react';
import type { Collection } from '@/types/collections.types';
import IconButton from '@/components/ui/IconButton';
import SearchBar from '@/components/patterns/SearchBar';

// Internal Components
import CollectionListItem from './CollectionListItem';

interface CollectionListProps {
  collections: Collection[];
  onSelect: (collection: Collection) => void;
  onCreate: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  selectedId?: string;
  allMediaCount?: number;
}

export const CollectionList = ({
  collections,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  selectedId,
  allMediaCount,
}: CollectionListProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedCollections = useMemo<Collection[]>(() => {
    return [...collections]
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (a.is_all_media && !b.is_all_media) return -1;
        if (!a.is_all_media && b.is_all_media) return 1;
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return b.created_at - a.created_at;
      });
  }, [collections, searchQuery]);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-base md:text-lg font-medium text-primary">Your Collections</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search collections..."
            containerClassName="w-full sm:max-w-[240px]"
          />
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
            <div className="flex items-center gap-1 glass-card p-1 rounded-xl">
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
            <button
              onClick={onCreate}
              className="p-1.5 md:p-2 rounded-full bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40 transition-colors shadow-lg shadow-brand-primary/10"
              aria-label="Create new collection"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`
        grid gap-4 
        ${viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8' 
          : 'grid-cols-1 md:grid-cols-2'}
      `}>
        {sortedCollections.map((collection) => (
          <CollectionListItem 
            key={collection.id}
            collection={collection}
            viewMode={viewMode}
            selectedId={selectedId}
            allMediaCount={allMediaCount}
            openMenuId={openMenuId}
            onSelect={onSelect}
            onToggleMenu={toggleMenu}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {sortedCollections.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl col-span-full">
            <Folder className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">
              {searchQuery ? 'No results found' : 'No collections yet'}
            </h3>
            <p className="text-text-secondary text-sm">
              {searchQuery 
                ? `We couldn't find any collection matching "${searchQuery}"` 
                : 'Create your first collection to get started!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-brand-primary text-sm font-medium hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      
      {openMenuId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setOpenMenuId(null)} 
        />
      )}
    </div>
  );
};

export default CollectionList;
