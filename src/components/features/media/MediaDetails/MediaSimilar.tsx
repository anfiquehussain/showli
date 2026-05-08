import { useGetSimilarQuery } from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import { Compass } from 'lucide-react';

interface MediaSimilarProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaSimilar = ({ id, type }: MediaSimilarProps) => {
  const { data, isLoading } = useGetSimilarQuery({ type, id });
  const results = data?.results || [];

  return (
    <div className="container mx-auto px-4 md:px-8 pb-12">
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
