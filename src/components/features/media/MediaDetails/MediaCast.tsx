import { User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetCreditsQuery, useGetTVCreditsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbCastMember } from '@/types/tmdb.types';
import ScrollContainer from '@/components/patterns/ScrollContainer';
import Skeleton from '../../../ui/Skeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface MediaCastProps {
  id: number;
  type: 'movie' | 'tv';
  onShowFullCredits: () => void;
}

const MediaCast = ({ id, type, onShowFullCredits }: MediaCastProps) => {
  const [containerRef, isVisible] = useIntersectionObserver({ rootMargin: '200px' });
  
  const movieCredits = useGetCreditsQuery(id, { skip: type !== 'movie' || !isVisible });
  const tvCredits = useGetTVCreditsQuery(id, { skip: type !== 'tv' || !isVisible });

  const credits = type === 'movie' ? movieCredits.data : tvCredits.data;
  const isLoading = (movieCredits.isLoading || tvCredits.isLoading) && isVisible;

  if (!isVisible || isLoading) return (
    <section ref={containerRef} className="space-y-4">
      <Skeleton className="h-48 rounded-3xl" />
    </section>
  );
  if (!credits?.cast.length) return null;

  // Take top 10 cast members
  const topCast = credits.cast.slice(0, 10);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Top Cast
        </h2>
        
        <button 
          onClick={onShowFullCredits}
          className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
        >
          View Full Credits
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <ScrollContainer className="gap-4 pb-4">
        {topCast.map((person: TmdbCastMember) => (
          <Link 
            key={person.id} 
            to={`/person/${person.id}`}
            className="shrink-0 w-24 md:w-32 group block"
          >
            <div className="aspect-2/3 rounded-2xl bg-white/5 border border-white/5 overflow-hidden mb-3 group-hover:border-brand-primary/50 transition-colors">
              {person.profile_path ? (
                <img 
                  src={getTmdbImageUrl(person.profile_path, 'w185')} 
                  alt={person.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white/20" />
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                {person.name}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {type === 'movie' ? person.character : person.roles?.[0]?.character}
              </p>
            </div>
          </Link>
        ))}
        
        <button 
          onClick={onShowFullCredits}
          className="shrink-0 w-24 md:w-32 group text-left"
        >
          <div className="aspect-2/3 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center mb-3 group-hover:border-brand-primary/50 group-hover:bg-brand-primary/5 transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-brand-primary" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[13px] font-bold text-white/40 group-hover:text-brand-primary transition-colors">
              View All
            </h4>
            <p className="text-[11px] text-muted-foreground/30">
              Full Credits
            </p>
          </div>
        </button>
      </ScrollContainer>
    </section>
  );
};

export default MediaCast;
