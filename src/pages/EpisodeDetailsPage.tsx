import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EpisodeDetails from '@/components/features/media/EpisodeDetails';

const EpisodeDetailsPage = () => {
  const { id, seasonNumber, episodeNumber } = useParams<{ 
    id: string; 
    seasonNumber: string; 
    episodeNumber: string; 
  }>();

  const tvId = parseInt(id || '', 10);
  const seasonNum = parseInt(seasonNumber || '', 10);
  const episodeNum = parseInt(episodeNumber || '', 10);

  // Side effect for page metadata / title
  useEffect(() => {
    if (!isNaN(tvId) && !isNaN(seasonNum) && !isNaN(episodeNum)) {
      document.title = `Showli — S${seasonNum < 10 ? '0' + seasonNum : seasonNum}E${episodeNum < 10 ? '0' + episodeNum : episodeNum} Episode Details`;
    }
  }, [tvId, seasonNum, episodeNum]);

  if (isNaN(tvId) || isNaN(seasonNum) || isNaN(episodeNum)) {
    return <Navigate to="/" replace />;
  }

  return (
    <EpisodeDetails 
      tvId={tvId} 
      seasonNumber={seasonNum} 
      episodeNumber={episodeNum} 
    />
  );
};

export default EpisodeDetailsPage;
