import { useContext } from 'react';
import { AddToCollectionContext } from '@/components/features/collections/AddToCollectionProvider';

export const useAddToCollection = () => {
  const context = useContext(AddToCollectionContext);
  if (!context) {
    throw new Error('useAddToCollection must be used within an AddToCollectionProvider');
  }
  return context;
};
