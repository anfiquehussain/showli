import { useGetRecommendationsQuery } from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import { Sparkles } from 'lucide-react';

interface MediaRecommendationsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaRecommendations = ({ id, type }: MediaRecommendationsProps) => {
  const { data, isLoading } = useGetRecommendationsQuery({ type, id });
  const results = data?.results || [];

  return (
    <div className="container mx-auto px-4 md:px-8">
      <div className="border-t border-white/5 pt-8">
        <MediaScroll 
          title="Recommended For You"
          icon={<Sparkles className="w-4 h-4" />}
          items={results}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MediaRecommendations;
