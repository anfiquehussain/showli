import { useGetRecommendationsQuery } from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import { Sparkles } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface MediaRecommendationsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaRecommendations = ({ id, type }: MediaRecommendationsProps) => {
  const [sectionRef, isVisible] = useIntersectionObserver({ rootMargin: '600px' });
  const { data, isLoading } = useGetRecommendationsQuery({ type, id }, { skip: !isVisible });
  const results = data?.results || [];

  return (
    <div ref={sectionRef}>
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
