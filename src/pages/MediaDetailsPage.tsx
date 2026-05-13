import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MediaDetails from '@/components/features/media/MediaDetails/index';
import AddToCollectionModal from '@/components/features/collections/AddToCollectionModal/index';
import { useGetMovieDetailsQuery, useGetTVDetailsQuery } from '@/api/media/mediaApi';

const MediaDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const numericId = Number(id);
  const type = pathname.includes('/movie/') ? 'movie' : 'tv';

  const movieQuery = useGetMovieDetailsQuery(numericId, { skip: type !== 'movie' || !id });
  const tvQuery = useGetTVDetailsQuery(numericId, { skip: type !== 'tv' || !id });

  const { data: media } = type === 'movie' ? movieQuery : tvQuery;

  if (!id) return null;

  return (
    <>
      <MediaDetails 
        id={numericId} 
        type={type} 
        onAddToCollection={() => setIsAddModalOpen(true)}
      />

      {media && (
        <AddToCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          media={media}
        />
      )}
    </>
  );
};

export default MediaDetailsPage;
