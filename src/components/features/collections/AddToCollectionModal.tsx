import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/patterns/Modal';
import { Folder, Check, Plus, Loader2 } from 'lucide-react';
import type { TmdbMedia } from '@/types/tmdb.types';
import type { Collection } from '@/types/collections.types';
import { 
  useGetCollectionsQuery, 
  useAddMovieToCollectionMutation, 
  useRemoveMovieFromCollectionMutation, 
  useGetCollectionMoviesQuery,
  useCreateCollectionMutation
} from '@/api/collections/collectionsApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import CollectionModal from './CollectionModal';

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

  const [addMovie] = useAddMovieToCollectionMutation();
  const [removeMovie] = useRemoveMovieFromCollectionMutation();
  const [createCollection] = useCreateCollectionMutation();

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAndAdd = async (data: { name: string; description: string; color: string; visibility: 'private' | 'public' }) => {
    if (!user || !media) return;

    setIsSubmitting(true);
    try {
      // 1. Create the collection
      const newCollection = await createCollection({
        uid: user.uid,
        data: {
          ...data,
          is_default: false
        }
      }).unwrap();

      // 2. Add movie to the new collection
      const type = 'title' in media ? 'movie' : 'tv';
      const title = 'title' in media ? media.title : media.name;
      const release_date = 'release_date' in media ? media.release_date : media.first_air_date;

      await addMovie({
        uid: user.uid,
        collectionId: newCollection.id,
        movie: {
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
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCollection = async (collectionId: string, isAdded: boolean) => {
    if (!user || !media) return;

    try {
      if (isAdded) {
        await removeMovie({ uid: user.uid, collectionId, tmdbId: media.id }).unwrap();
        success('Removed from collection');
      } else {
        const type = 'title' in media ? 'movie' : 'tv';
        const title = 'title' in media ? media.title : media.name;
        const release_date = 'release_date' in media ? media.release_date : media.first_air_date;

        await addMovie({
          uid: user.uid,
          collectionId,
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
      console.error(err);
    }
  };

  if (!media) return null;

  const title = 'title' in media ? media.title : media.name;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save to Collection"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Select collections to save <strong className="text-primary">{title}</strong>.
        </p>

        {isLoadingCollections ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-card/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => setIsCollectionModalOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group mb-2"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-brand-primary/20 transition-colors">
                <Plus className="w-4 h-4 text-text-secondary group-hover:text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">Create New Collection</span>
            </button>

            {collections
              .filter(c => !c.is_all_media)
              .map((collection) => (
                <CollectionItem 
                  key={collection.id} 
                  collection={collection} 
                  mediaId={media.id}
                  onToggle={(isAdded) => handleToggleCollection(collection.id, isAdded)}
                />
              ))}
            {collections.length === 0 && (
              <div className="text-center p-4 text-text-secondary text-sm glass-card rounded-xl">
                You don't have any collections yet. Create one first!
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

// Extracted component to handle individual collection query and optimistic state
const CollectionItem = ({ 
  collection, 
  mediaId,
  onToggle
}: { 
  collection: Collection, 
  mediaId: number,
  onToggle: (isAdded: boolean) => void 
}) => {
  const { user } = useAuth();
  const { data: movies = [], isFetching } = useGetCollectionMoviesQuery({ uid: user?.uid || '', collectionId: collection.id }, {
    skip: !user
  });
  
  const isAdded = movies.some(m => m.tmdb_id === mediaId);

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
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: collection.color || 'var(--brand-primary)' }}
        >
          <Folder className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-primary">{collection.name}</span>
      </div>
      
      {isAdded && (
        <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};

export default AddToCollectionModal;
