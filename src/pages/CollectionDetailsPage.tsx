import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetCollectionMoviesQuery, 
  useGetAllCollectionMoviesQuery,
  useGetCollectionsQuery,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useRemoveMovieFromCollectionMutation,
  useRemoveMovieFromLibraryMutation
} from '@/api/collections/collectionsApi';
import { CollectionDetails } from '@/components/features/collections/CollectionDetails';
import { CollectionModal } from '@/components/features/collections/CollectionModal';
import AddMediaModal from '@/components/features/collections/AddMediaModal';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const CollectionDetailsPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { data: collections = [], isLoading: isLoadingCollections } = useGetCollectionsQuery(user?.uid || '', {
    skip: !user,
  });

  const { data: movies = [], isLoading: isLoadingMovies } = useGetCollectionMoviesQuery(
    { uid: user?.uid || '', collectionId: collectionId || '' },
    { skip: !user || !collectionId || collections.find(c => c.id === collectionId)?.is_all_media }
  );

  const { data: allMovies = [], isLoading: isLoadingAllMovies } = useGetAllCollectionMoviesQuery(
    user?.uid || '',
    { skip: !user || !collections.find(c => c.id === collectionId)?.is_all_media }
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [movieToRemove, setMovieToRemove] = useState<number | null>(null);

  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();
  const [removeMovie] = useRemoveMovieFromCollectionMutation();
  const [removeMovieFromLibrary] = useRemoveMovieFromLibraryMutation();

  const collection = collections.find((c) => c.id === collectionId);

  if (isAuthLoading || isLoadingCollections) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-card/50 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card/50 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-primary mb-2">Collection Not Found</h2>
        <p className="text-text-secondary mb-6">The collection you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          onClick={() => navigate('/collections')}
          className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
        >
          Back to Collections
        </button>
      </div>
    );
  }

  const handleEditSubmit = async (data: any) => {
    if (!user || !collectionId) return;
    try {
      await updateCollection({ uid: user.uid, collectionId, data }).unwrap();
      success('Collection updated');
      setIsEditModalOpen(false);
    } catch (err) {
      error('Failed to update collection');
    }
  };

  const handleDelete = async () => {
    if (!user || !collectionId || collection.is_default || collection.is_all_media) return;
    
    try {
      await deleteCollection({ uid: user.uid, collectionId }).unwrap();
      success('Collection deleted');
      setIsDeleteConfirmOpen(false);
      navigate('/collections');
    } catch (err) {
      error('Failed to delete collection');
    }
  };


  const handleRemoveMovie = (tmdbId: number) => {
    if (collection.is_all_media) {
      setMovieToRemove(tmdbId);
    } else {
      executeRemove(tmdbId);
    }
  };

  const executeRemove = async (tmdbId: number) => {
    if (!user || !collectionId) return;
    try {
      if (collection.is_all_media) {
        await removeMovieFromLibrary({ uid: user.uid, tmdbId }).unwrap();
        success('Removed from all collections');
        setMovieToRemove(null);
      } else {
        await removeMovie({ uid: user.uid, collectionId, tmdbId }).unwrap();
        success('Removed from collection');
      }
    } catch (err) {
      error('Failed to remove movie');
    }
  };

  const displayMovies = collection.is_all_media ? allMovies : movies;
  const isLoadingDisplay = collection.is_all_media ? isLoadingAllMovies : isLoadingMovies;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button 
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Collections
      </button>

      <CollectionDetails
        collection={collection}
        movies={displayMovies}
        isLoading={isLoadingDisplay}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteConfirmOpen(true)}
        onAddMedia={() => setIsAddMediaOpen(true)}
        onRemoveMovie={handleRemoveMovie}
      />

      <CollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        collection={collection}
        isLoading={isUpdating}
      />

      {collection && (
        <AddMediaModal
          isOpen={isAddMediaOpen}
          onClose={() => setIsAddMediaOpen(false)}
          collection={collection}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={movieToRemove !== null}
        onClose={() => setMovieToRemove(null)}
        onConfirm={() => movieToRemove && executeRemove(movieToRemove)}
        title="Remove from Library"
        message="This will remove the movie from ALL your collections. Are you sure?"
        confirmLabel="Remove"
        variant="danger"
      />
    </motion.div>
  );
};

export default CollectionDetailsPage;
