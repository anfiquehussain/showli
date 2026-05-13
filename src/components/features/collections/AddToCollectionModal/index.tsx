import { useState } from 'react';
import Modal from '@/components/patterns/Modal';
import SearchBar from '@/components/patterns/SearchBar';
import CollectionModal from '@/components/features/collections/CollectionModal';
import { Plus, SearchX, ArrowUpDown, Clock, Type, Hash } from 'lucide-react';
import type { TmdbMedia } from '@/types/tmdb.types';
import type { CollectionFormData } from '@/types/collections.types';
import { 
  useGetCollectionsQuery, 
  useAddMediaToCollectionMutation, 
  useRemoveMediaFromCollectionMutation, 
  useCreateCollectionMutation
} from '@/api/collections/collectionsApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

// Internal Components
import CollectionItem from './CollectionItem';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: TmdbMedia | null;
}

export const AddToCollectionModal = ({ isOpen, onClose, media }: AddToCollectionModalProps) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const { data: collections = [], isLoading: isLoadingCollections } = useGetCollectionsQuery(user?.uid || '', {
    skip: !user || !isOpen,
  });

  const [addMedia] = useAddMediaToCollectionMutation();
  const [removeMedia] = useRemoveMediaFromCollectionMutation();
  const [createCollection] = useCreateCollectionMutation();

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredCollections = collections.filter(c => 
    !c.is_all_media && 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'count') {
      comparison = (a.media_count || 0) - (b.media_count || 0);
    } else if (sortBy === 'recent') {
      comparison = (a.created_at || 0) - (b.created_at || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCreateAndAdd = async (data: CollectionFormData) => {
    if (!user || !media) return;

    setIsSubmitting(true);
    try {
      const newCollection = await createCollection({
        uid: user.uid,
        data: { ...data, is_default: false }
      }).unwrap();

      const type = 'title' in media ? 'movie' : 'tv';
      const title = 'title' in media ? media.title : media.name;
      const release_date = 'release_date' in media ? media.release_date : media.first_air_date;

      await addMedia({
        uid: user.uid,
        collectionId: newCollection.id,
        media: {
          tmdb_id: media.id,
          media_type: type,
          title,
          poster_path: media.poster_path,
          release_date: release_date || '',
          vote_average: media.vote_average
        }
      }).unwrap();

      success(`Created "${data.name}" and added ${title}`);
      setIsCollectionModalOpen(false);
    } catch (err) {
      error('Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCollection = async (collectionId: string, isAdded: boolean) => {
    if (!user || !media) return;
    try {
      if (isAdded) {
        await removeMedia({ uid: user.uid, collectionId, tmdbId: media.id }).unwrap();
        success('Removed from collection');
      } else {
        const type = 'title' in media ? 'movie' : 'tv';
        const title = 'title' in media ? media.title : media.name;
        const release_date = 'release_date' in media ? media.release_date : media.first_air_date;

        await addMedia({
          uid: user.uid,
          collectionId,
          media: { 
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

  if (!media) return null;
  const title = 'title' in media ? media.title : media.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to Collection">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Select collections to save <strong className="text-primary">{title}</strong>.
        </p>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search collections…"
          className="bg-card/30 border-white/5"
        />

        {collections.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => {
                  if (sortBy === 'name') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('name'); setSortOrder('asc'); }
                }}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${sortBy === 'name' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-secondary hover:text-primary hover:bg-white/5'}`}
              >
                <Type className="w-3 h-3" />
                <span>Name</span>
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'count') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('count'); setSortOrder('desc'); }
                }}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${sortBy === 'count' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-secondary hover:text-primary hover:bg-white/5'}`}
              >
                <Hash className="w-3 h-3" />
                <span>Count</span>
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'recent') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('recent'); setSortOrder('desc'); }
                }}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold ${sortBy === 'recent' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-secondary hover:text-primary hover:bg-white/5'}`}
              >
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </button>
            </div>
            
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-text-secondary hover:text-primary hover:border-white/10 transition-all active:scale-95"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {isLoadingCollections ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-card/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {!searchQuery && (
              <button
                onClick={() => setIsCollectionModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group mb-2"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-brand-primary/20 transition-colors">
                  <Plus className="w-4 h-4 text-text-secondary group-hover:text-brand-primary" />
                </div>
                <span className="text-sm font-medium text-text-secondary group-hover:text-primary">Create New Collection</span>
              </button>
            )}

            {sortedCollections.map((collection) => (
              <CollectionItem 
                key={collection.id} 
                collection={collection} 
                mediaId={media.id}
                onToggle={(isAdded) => handleToggleCollection(collection.id, isAdded)}
              />
            ))}

            {collections.length === 0 && !isLoadingCollections && (
              <div className="text-center p-8 text-text-secondary text-sm glass-card rounded-xl">
                You don't have any collections yet. Create one first!
              </div>
            )}

            {collections.length > 0 && filteredCollections.length === 0 && searchQuery && (
              <div className="text-center py-10 px-4 glass-card rounded-xl border border-white/5 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-secondary">
                  <SearchX className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">No collections found</p>
                  <p className="text-xs text-text-secondary">Try a different search term or create a new one.</p>
                </div>
                <button
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-medium hover:bg-brand-primary/20 transition-colors border border-brand-primary/20"
                >
                  Create "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        )}

        <CollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onSubmit={handleCreateAndAdd}
          isLoading={isSubmitting}
        />

        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddToCollectionModal;
