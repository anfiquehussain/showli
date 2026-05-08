import { motion } from 'framer-motion';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';
import CollectionList from '@/components/features/collections/CollectionList/index';
import { CollectionModal } from '@/components/features/collections/CollectionModal';
import CollectionsHero from '@/components/features/collections/CollectionsHero';
import { useCollectionsManagement } from '@/components/features/collections/hooks/useCollectionsManagement';

const CollectionsPage = () => {
  const {
    collections,
    allMedia,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isModalOpen,
    setIsModalOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    editingCollection,
    deletingCollection,
    stats,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    handleSubmit,
    handleSelect
  } = useCollectionsManagement();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-card/50 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-card/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <CollectionsHero stats={stats} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <CollectionList
          collections={collections}
          allMediaCount={allMedia.length}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </motion.div>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        collection={editingCollection}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Collection"
        message={`Are you sure you want to delete "${deletingCollection?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionsPage;
