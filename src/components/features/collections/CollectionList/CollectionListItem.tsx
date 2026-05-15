import { motion, AnimatePresence } from 'framer-motion';
import { Folder, MoreVertical, Edit2, Trash2, Pin } from 'lucide-react';
import type { Collection } from '@/types/collections.types';

interface CollectionListItemProps {
  collection: Collection;
  viewMode: 'grid' | 'list';
  selectedId?: string;
  allMediaCount?: number;
  openMenuId: string | null;
  onSelect: (collection: Collection) => void;
  onToggleMenu: (e: React.MouseEvent, id: string) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

const CollectionListItem = ({
  collection,
  viewMode,
  selectedId,
  allMediaCount,
  openMenuId,
  onSelect,
  onToggleMenu,
  onEdit,
  onDelete
}: CollectionListItemProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative group flex transition-all duration-500 border cursor-pointer
        ${viewMode === 'grid' ? 'flex-col items-center p-4 pt-6' : 'items-center justify-between p-4'}
        ${selectedId === collection.id 
          ? 'bg-brand-primary/20 border-brand-primary/50 shadow-xl shadow-brand-primary/10' 
          : 'glass-card border-white/5 hover:border-white/20 hover:bg-white/10 shadow-lg'}
        rounded-3xl
        ${openMenuId === collection.id ? 'z-50' : 'z-0'}
      `}
      onClick={() => onSelect(collection)}
    >
      {/* Background Glow for Grid Mode */}
      {viewMode === 'grid' && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl rounded-3xl"
          style={{ backgroundColor: collection.color || 'var(--brand-primary)' }}
        />
      )}

      <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
        <div 
          className={`
            rounded-xl flex items-center justify-center shrink-0 relative shadow-xl
            ${viewMode === 'grid' ? 'w-14 h-14 mb-3' : 'w-12 h-12'}
          `}
          style={{ 
            backgroundColor: collection.color || 'var(--brand-primary)',
            boxShadow: `0 4px 20px -5px ${collection.color || 'var(--brand-primary)'}80`
          }}
        >
          <Folder className={`${viewMode === 'grid' ? 'w-7 h-7' : 'w-6 h-6'} text-white drop-shadow-sm`} />
          
          {viewMode === 'grid' && (
            <div className="absolute -bottom-1.5 -right-1.5 bg-background border border-white/10 px-1.5 py-0.5 rounded-full shadow-md">
              <p className="text-[9px] font-bold text-primary whitespace-nowrap">
                {collection.is_all_media && allMediaCount !== undefined 
                  ? allMediaCount 
                  : collection.media_count}
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
                : collection.media_count} items
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
          onClick={(e) => onToggleMenu(e, collection.id)}
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
  );
};

export default CollectionListItem;
