import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetCollectionsQuery, 
  useCreateCollectionMutation, 
  useUpdateCollectionMutation, 
  useDeleteCollectionMutation,
  useGetAllCollectionMediaQuery
} from '@/api/collections/collectionsApi';
import { useToast } from '@/hooks/useToast';
import type { Collection } from '@/types/collections.types';
import { Library, ListMusic, Eye, CheckCircle2 } from 'lucide-react';

const DEFAULT_COLORS = {
  primary: 'var(--color-palette-indigo)',
  pink: 'var(--color-palette-pink)',
  success: 'var(--color-palette-emerald)',
  error: 'var(--color-palette-rose)',
  slate: 'var(--color-palette-slate)',
};

export const useCollectionsManagement = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { data: collections = [], isLoading: isLoadingCollections } = useGetCollectionsQuery(user?.uid || '', {
    skip: !user,
  });

  const { data: allMedia = [] } = useGetAllCollectionMediaQuery(user?.uid || '', {
    skip: !user,
  });

  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

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
      value: allMedia.length, 
      icon: ListMusic, 
      color: 'text-brand-secondary',
      bg: 'bg-brand-secondary/10'
    },
    { 
      label: 'Plan to Watch', 
      value: allMedia.filter(m => m.status === 'planned').length, 
      icon: Eye, 
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    { 
      label: 'Watched', 
      value: allMedia.filter(m => m.status === 'completed').length, 
      icon: CheckCircle2, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
  ], [collections.length, allMedia]);

  useEffect(() => {
    if (!user || isLoadingCollections) return;

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
  }, [user, isLoadingCollections, collections.length, createCollection]);

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

  const handleSubmit = async (data: any) => {
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
      error(`Failed to ${editingCollection ? 'update' : 'create'} collection`);
    }
  };

  const handleSelect = (collection: Collection) => {
    navigate(`/collections/${collection.id}`);
  };

  return {
    user,
    collections,
    allMedia,
    isLoading: isAuthLoading || isLoadingCollections,
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
  };
};
