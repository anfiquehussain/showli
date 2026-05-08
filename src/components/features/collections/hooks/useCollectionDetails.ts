import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetCollectionMediaQuery, 
  useGetAllCollectionMediaQuery,
  useGetCollectionsQuery,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useRemoveMediaFromCollectionMutation,
  useRemoveMediaFromLibraryMutation
} from '@/api/collections/collectionsApi';
import { useToast } from '@/hooks/useToast';
import type { Collection } from '@/types/collections.types';

export const useCollectionDetails = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { data: collections = [], isLoading: isLoadingCollections } = useGetCollectionsQuery(user?.uid || '', {
    skip: !user,
  });

  const collection = collections.find((c) => c.id === collectionId);
  const isAllMedia = collection?.is_all_media;

  const { data: mediaItems = [], isLoading: isLoadingMedia } = useGetCollectionMediaQuery(
    { uid: user?.uid || '', collectionId: collectionId || '' },
    { skip: !user || !collectionId || isAllMedia }
  );

  const { data: allMedia = [], isLoading: isLoadingAllMedia } = useGetAllCollectionMediaQuery(
    user?.uid || '',
    { skip: !user || !isAllMedia }
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState<number | null>(null);

  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();
  const [removeMedia] = useRemoveMediaFromCollectionMutation();
  const [removeMediaFromLibrary] = useRemoveMediaFromLibraryMutation();

  const handleEditSubmit = async (data: Partial<Collection>) => {
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
    if (!user || !collectionId || collection?.is_default || isAllMedia) return;
    try {
      await deleteCollection({ uid: user.uid, collectionId }).unwrap();
      success('Collection deleted');
      setIsDeleteConfirmOpen(false);
      navigate('/collections');
    } catch (err) {
      error('Failed to delete collection');
    }
  };

  const handleRemoveMedia = (tmdbId: number) => {
    if (isAllMedia) {
      setMediaToRemove(tmdbId);
    } else {
      executeRemove(tmdbId);
    }
  };

  const executeRemove = async (tmdbId: number) => {
    if (!user || !collectionId) return;
    try {
      if (isAllMedia) {
        await removeMediaFromLibrary({ uid: user.uid, tmdbId }).unwrap();
        success('Removed from all collections');
        setMediaToRemove(null);
      } else {
        await removeMedia({ uid: user.uid, collectionId, tmdbId }).unwrap();
        success('Removed from collection');
      }
    } catch (err) {
      error('Failed to remove media');
    }
  };

  const displayMedia = isAllMedia ? allMedia : mediaItems;
  const isLoadingDisplay = isAllMedia ? isLoadingAllMedia : isLoadingMedia;

  return {
    collection,
    displayMedia,
    isLoading: isAuthLoading || isLoadingCollections || isLoadingDisplay,
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
  };
};
