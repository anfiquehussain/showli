import { User, ChevronRight } from 'lucide-react';
import { useGetCreditsQuery, useGetTVCreditsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbCrewMember } from '@/types/tmdb.types';
import ScrollContainer from '@/components/patterns/ScrollContainer';

interface MediaCrewProps {
  id: number;
  type: 'movie' | 'tv';
  onShowFullCredits: () => void;
}

const MediaCrew = ({ id, type, onShowFullCredits }: MediaCrewProps) => {
  const movieCredits = useGetCreditsQuery(id, { skip: type !== 'movie' });
  const tvCredits = useGetTVCreditsQuery(id, { skip: type !== 'tv' });

  const credits = type === 'movie' ? movieCredits.data : tvCredits.data;
  const isLoading = movieCredits.isLoading || tvCredits.isLoading;

  if (isLoading) return <div className="h-48 glass-card rounded-3xl animate-pulse" />;
  if (!credits?.crew.length) return null;

  // Filter for prominent crew members
  const prominentJobs = ['Director', 'Executive Producer', 'Producer', 'Screenplay', 'Writer', 'Creator'];
  
  const topCrew = credits.crew
    .filter((person: TmdbCrewMember) => {
      if (type === 'movie') {
        return prominentJobs.includes(person.job || '');
      } else {
        return person.jobs?.some(j => prominentJobs.includes(j.job));
      }
    })
    .slice(0, 10);

  // If no prominent crew found, just take the first 10
  const displayCrew = topCrew.length > 0 ? topCrew : credits.crew.slice(0, 10);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Top Crew
        </h2>
        
        <button 
          onClick={onShowFullCredits}
          className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
        >
          View Full Credits
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <ScrollContainer className="gap-3 pb-4">
        {displayCrew.map((person: TmdbCrewMember, idx) => (
          <div 
            key={`${person.id}-${idx}`} 
            className="flex-shrink-0 w-36 md:w-48 group bg-white/5 border border-white/5 rounded-2xl p-2.5 flex items-center gap-3 hover:border-brand-primary/30 hover:bg-white/[0.07] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-brand-primary/50 transition-colors">
              {person.profile_path ? (
                <img 
                  src={getTmdbImageUrl(person.profile_path, 'w185')} 
                  alt={person.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white/20" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-bold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                {person.name}
              </h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">
                {type === 'movie' ? person.job : person.jobs?.[0]?.job}
              </p>
              {person.total_episode_count && (
                <p className="text-[9px] text-brand-primary/80 font-black tracking-tighter mt-0.5">
                  {person.total_episode_count} EPISODES
                </p>
              )}
            </div>
          </div>
        ))}
        
        <button 
          onClick={onShowFullCredits}
          className="flex-shrink-0 w-24 md:w-32 flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-dashed border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group p-2"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-brand-primary" />
          </div>
          <span className="text-[10px] font-bold text-white/40 group-hover:text-brand-primary">View All</span>
        </button>
      </ScrollContainer>
    </section>
  );
};

export default MediaCrew;
