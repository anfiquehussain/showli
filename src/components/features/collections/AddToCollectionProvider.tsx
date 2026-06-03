import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TmdbMedia } from '@/types/tmdb.types';
import AddToCollectionModal from '@/components/features/collections/AddToCollectionModal/index';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface AddToCollectionContextType {
  openAddToCollection: (media: TmdbMedia) => void;
}

export const AddToCollectionContext = createContext<AddToCollectionContextType | undefined>(undefined);

export const AddToCollectionProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<TmdbMedia | null>(null);
  const { user } = useAuth();
  const { error } = useToast();

  const openAddToCollection = (media: TmdbMedia) => {
    if (!user) {
      error('Please sign in to add media to collections');
      return;
    }
    setActiveMedia(media);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveMedia(null);
  };

  return (
    <AddToCollectionContext.Provider value={{ openAddToCollection }}>
      {children}
      <AddToCollectionModal
        isOpen={isOpen}
        onClose={handleClose}
        media={activeMedia}
      />
    </AddToCollectionContext.Provider>
  );
};
