import { useParams, useLocation } from 'react-router-dom';
import MediaDetails from '@/components/features/media/MediaDetails/index';

const MediaDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const type = pathname.includes('/movie/') ? 'movie' : 'tv';

  if (!id) return null;

  return <MediaDetails id={Number(id)} type={type} />;
};

export default MediaDetailsPage;
