import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/patterns/PageHeader';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';
import { CollectionList } from '@/components/features/collections/CollectionList';
import { CollectionModal } from '@/components/features/collections/CollectionModal';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetCollectionsQuery, 
  useCreateCollectionMutation, 
  useUpdateCollectionMutation, 
  useDeleteCollectionMutation,
  useGetAllCollectionMoviesQuery
} from '@/api/collections/collectionsApi';
import { useToast } from '@/hooks/useToast';
import type { Collection } from '@/types/collections.types';
import { motion } from 'framer-motion';
import { Library, ListMusic, Eye, CheckCircle2 } from 'lucide-react';

// Default collection colors matching theme variables where possible
const DEFAULT_COLORS = {
  primary: 'var(--color-palette-indigo)',
  pink: 'var(--color-palette-pink)',
  success: 'var(--color-palette-emerald)',
  error: 'var(--color-palette-rose)',
  slate: 'var(--color-palette-slate)',
};

export const CollectionsPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { data: collections = [], isLoading } = useGetCollectionsQuery(user?.uid || '', {
    skip: !user,
  });

  const { data: allMovies = [] } = useGetAllCollectionMoviesQuery(user?.uid || '', {
    skip: !user,
  });

  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  // Statistics for the dashboard
  const stats = useMemo(() => [
    { 
      label: 'Total Collections', 
      value: collections.length, 
      icon: Library, 
      color: 'text-brand-primary',
      bg: 'bg-brand-primary/10'
    },
    { 
      label: 'Total Titles', 
      value: allMovies.length, 
      icon: ListMusic, 
      color: 'text-brand-secondary',
      bg: 'bg-brand-secondary/10'
    },
    { 
      label: 'Plan to Watch', 
      value: allMovies.filter(m => m.status === 'planned').length, 
      icon: Eye, 
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    { 
      label: 'Watched', 
      value: allMovies.filter(m => m.status === 'completed').length, 
      icon: CheckCircle2, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
  ], [collections.length, allMovies]);

  // Initial creation of default collections if they don't exist
  useEffect(() => {
    if (!user || isLoading) return;

    const createMissingDefaults = async () => {
      try {
        const defaults = [
          { name: 'All Media', color: DEFAULT_COLORS.slate, icon: 'archive', visibility: 'private' as const, is_all_media: true },
          { name: 'Watchlist', color: DEFAULT_COLORS.primary, icon: 'list', visibility: 'private' as const },
          { name: 'Favorites', color: DEFAULT_COLORS.pink, icon: 'heart', visibility: 'public' as const },
          { name: 'Watched', color: DEFAULT_COLORS.success, icon: 'check', visibility: 'private' as const },
          { name: 'Dropped', color: DEFAULT_COLORS.error, icon: 'x', visibility: 'private' as const }
        ];

        const hasAllMedia = collections.some(c => c.is_all_media);
        
        if (collections.length === 0) {
          for (const def of defaults) {
            await createCollection({
              uid: user.uid,
              data: { ...def, is_default: true, description: `Default ${def.name} collection` }
            }).unwrap();
          }
        } else if (!hasAllMedia) {
          const allMediaDef = defaults[0]!;
          await createCollection({
            uid: user.uid,
            data: { ...allMediaDef, is_default: true, description: `Default ${allMediaDef.name} collection` }
          }).unwrap();
        }
      } catch (err) {
        console.error('Failed to create default collections', err);
      }
    };

    createMissingDefaults();
  }, [user, isLoading, collections.length, createCollection]);


  const handleCreate = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (collection: Collection) => {
    if (collection.is_default || collection.is_all_media) return;
    setDeletingCollection(collection);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !deletingCollection) return;
    
    try {
      await deleteCollection({ uid: user.uid, collectionId: deletingCollection.id }).unwrap();
      success('Collection deleted successfully');
      setIsConfirmOpen(false);
      setDeletingCollection(null);
    } catch (err) {
      error('Failed to delete collection');
    }
  };

  const handleSubmit = async (data: { name: string; description: string; color: string; visibility: 'private' | 'public' }) => {
    if (!user) return;

    try {
      if (editingCollection) {
        await updateCollection({
          uid: user.uid,
          collectionId: editingCollection.id,
          data
        }).unwrap();
        success('Collection updated successfully');
      } else {
        await createCollection({
          uid: user.uid,
          data: { ...data, is_default: false }
        }).unwrap();
        success('Collection created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Create collection error:', err);
      error(`Failed to ${editingCollection ? 'update' : 'create'} collection`);
    }
  };

  const handleSelect = (collection: Collection) => {
    navigate(`/collections/${collection.id}`);
  };

  return (
    <div className="space-y-8 pb-10">
      {(isAuthLoading || isLoading) ? (
        <div className="space-y-6">
          <div className="h-64 bg-card/50 animate-pulse rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-card/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary/10 via-background to-background border border-white/5 p-6 md:p-12">
        <div className="relative z-10">
          <PageHeader 
            title="Your Library" 
            description="Manage your cinematic journey through custom collections and status tracking."
          />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-3 md:p-4 rounded-2xl border-white/5 flex items-center gap-3 md:gap-4"
              >
                <div className={`p-2.5 md:p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-text-secondary font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg md:text-xl font-bold text-primary">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/5 blur-[80px] -ml-24 -mb-24 rounded-full" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-card/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <CollectionList
            collections={collections}
            allMediaCount={allMovies.length}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </motion.div>
      )}
        </>
      )}

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
