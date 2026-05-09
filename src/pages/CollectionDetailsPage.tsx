import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import CollectionDetails from '@/components/features/collections/CollectionDetails/index';
import CollectionModal from '@/components/patterns/CollectionModal';
import AddMediaModal from '@/components/features/collections/AddMediaModal';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';
import { useCollectionDetails } from '@/components/features/collections/hooks/useCollectionDetails';

export const CollectionDetailsPage = () => {
  const {
    collection,
    displayMedia,
    isLoading,
    isUpdating,
    isDeleting,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isAddMediaOpen,
    setIsAddMediaOpen,
    mediaToRemove,
    setMediaToRemove,
    handleEditSubmit,
    handleDelete,
    handleRemoveMedia,
    executeRemove,
    navigate
  } = useCollectionDetails();

  if (isLoading && !collection) {
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
        mediaItems={displayMedia}
        isLoading={isLoading}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteConfirmOpen(true)}
        onAddMedia={() => setIsAddMediaOpen(true)}
        onRemoveMedia={handleRemoveMedia}
      />

      <CollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        collection={collection}
        isLoading={isUpdating}
      />

      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={() => setIsAddMediaOpen(false)}
        collection={collection}
      />

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
        isOpen={mediaToRemove !== null}
        onClose={() => setMediaToRemove(null)}
        onConfirm={() => mediaToRemove && executeRemove(mediaToRemove)}
        title="Remove from Library"
        message="This will remove the media from ALL your collections. Are you sure?"
        confirmLabel="Remove"
        variant="danger"
      />
    </motion.div>
  );
};

export default CollectionDetailsPage;
