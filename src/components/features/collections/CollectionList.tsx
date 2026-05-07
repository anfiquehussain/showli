import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, MoreVertical, Edit2, Trash2, Pin, LayoutGrid, Columns2 } from 'lucide-react';
import type { Collection } from '@/types/collections.types';
import IconButton from '@/components/ui/IconButton';

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

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      if (a.is_all_media && !b.is_all_media) return -1;
      if (!a.is_all_media && b.is_all_media) return 1;
      
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      
      return b.created_at - a.created_at;
    });
  }, [collections]);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-primary">Your Collections</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 glass-card p-1 rounded-xl mr-2">
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
            className="p-1.5 rounded-full bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/40 transition-colors"
            aria-label="Create new collection"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={`
        grid gap-4 
        ${viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8' 
          : 'grid-cols-1 md:grid-cols-2'}
      `}>
        {sortedCollections.map((collection) => (
          <motion.div
            key={collection.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative group flex transition-all duration-500 border cursor-pointer
              ${viewMode === 'grid' ? 'flex-col items-center p-4 pt-6' : 'items-center justify-between p-4'}
              ${selectedId === collection.id 
                ? 'bg-brand-primary/20 border-brand-primary/50 shadow-xl shadow-brand-primary/10' 
                : 'glass-card border-white/5 hover:border-white/20 hover:bg-white/10 shadow-lg'}
              rounded-[1.5rem]
              ${openMenuId === collection.id ? 'z-50' : 'z-0'}
            `}
            onClick={() => onSelect(collection)}
          >
            {/* Background Glow for Grid Mode */}
            {viewMode === 'grid' && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl rounded-[1.5rem]"
                style={{ backgroundColor: collection.color || 'var(--brand-primary)' }}
              />
            )}

            <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
              <div 
                className={`
                  rounded-xl flex items-center justify-center flex-shrink-0 relative shadow-xl
                  ${viewMode === 'grid' ? 'w-14 h-14 mb-3' : 'w-12 h-12'}
                `}
                style={{ 
                  backgroundColor: collection.color || 'var(--brand-primary)',
                  boxShadow: `0 4px 20px -5px ${collection.color || 'var(--brand-primary)'}80`
                }}
              >
                <Folder className={`${viewMode === 'grid' ? 'w-7 h-7' : 'w-6 h-6'} text-white drop-shadow-sm`} />
                
                {/* Items Count as Badge in Grid Mode */}
                {viewMode === 'grid' && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-background border border-white/10 px-1.5 py-0.5 rounded-full shadow-md">
                    <p className="text-[9px] font-bold text-primary whitespace-nowrap">
                      {collection.is_all_media && allMediaCount !== undefined 
                        ? allMediaCount 
                        : collection.movie_count}
                    </p>
                  </div>
                )}

                {collection.is_all_media && (
                  <div className="absolute -top-1.5 -left-1.5 bg-brand-primary text-white p-1 rounded-full shadow-lg border-2 border-background z-10">
                    <Pin className="w-2 h-2 fill-current" />
                  </div>
                )}
              </div>

              <div className={`overflow-hidden ${viewMode === 'grid' ? 'text-center w-full' : ''}`}>
                <div className={`flex items-center gap-1.5 ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                  <h3 className={`font-bold text-primary truncate ${viewMode === 'grid' ? 'text-[11px] leading-tight px-1' : 'text-base'}`}>
                    {collection.name}
                  </h3>
                  {collection.is_all_media && viewMode !== 'grid' && (
                    <Pin className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/20" aria-hidden="true" />
                  )}
                </div>
                {viewMode === 'list' && (
                  <p className="text-xs text-text-secondary font-medium mt-0.5">
                    {collection.is_all_media && allMediaCount !== undefined 
                      ? allMediaCount 
                      : collection.movie_count} items
                  </p>
                )}
              </div>
            </div>

            <div 
              className={`
                ${viewMode === 'grid' 
                  ? `absolute top-2 left-2 transition-opacity z-20 ${openMenuId === collection.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}` 
                  : 'relative ml-2'}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => toggleMenu(e, collection.id)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {openMenuId === collection.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute ${viewMode === 'grid' ? 'left-0' : 'right-0'} top-full mt-1 w-32 bg-background/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onEdit(collection);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {!collection.is_default && !collection.is_all_media && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          onDelete(collection);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {sortedCollections.length === 0 && (
          <div className="text-center p-6 text-text-secondary text-sm glass-card rounded-xl">
            No collections yet. Create one to get started!
          </div>
        )}
      </div>
      
      {/* Close menu when clicking outside - simple implementation */}
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
