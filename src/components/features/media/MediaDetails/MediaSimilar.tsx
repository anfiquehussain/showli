import { useGetSimilarQuery } from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import { Compass } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface MediaSimilarProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaSimilar = ({ id, type }: MediaSimilarProps) => {
  const [sectionRef, isVisible] = useIntersectionObserver({ rootMargin: '600px' });
  const { data, isLoading } = useGetSimilarQuery({ type, id }, { skip: !isVisible });
  const results = data?.results || [];

  return (
    <div ref={sectionRef} className="pb-12">
      <div className="border-t border-white/5 pt-8">
        <MediaScroll 
          title="Similar Titles"
          icon={<Compass className="w-4 h-4" />}
          items={results}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MediaSimilar;
