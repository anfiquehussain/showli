import { useState, useRef, useEffect } from 'react';
import { useGetSimilarQuery } from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import { Compass } from 'lucide-react';

interface MediaSimilarProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaSimilar = ({ id, type }: MediaSimilarProps) => {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px' });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const { data, isLoading } = useGetSimilarQuery({ type, id }, { skip: !isInView });
  const results = data?.results || [];

  return (
    <div ref={sectionRef} className="container mx-auto px-4 md:px-8 pb-12">
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
