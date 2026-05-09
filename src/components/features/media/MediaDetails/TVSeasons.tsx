import { useState } from 'react';
import { useGetTVSeasonDetailsQuery } from '@/api/media/mediaApi';
import type { TmdbTVSeasonBrief } from '@/types/tmdb.types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import ScrollContainer from '@/components/patterns/ScrollContainer';
import EpisodeCard from './EpisodeCard';

interface TVSeasonsProps {
  tvId: number;
  seasons: TmdbTVSeasonBrief[];
}

const TVSeasons = ({ tvId, seasons }: TVSeasonsProps) => {
  // Sort seasons by number, but handle season 0 (Specials) if it exists
  const sortedSeasons = [...seasons].sort((a, b) => a.season_number - b.season_number);
  
  const [selectedSeason, setSelectedSeason] = useState(
    sortedSeasons.find(s => s.season_number === 1)?.season_number ?? sortedSeasons[0]?.season_number ?? 0
  );
  
  const [visibleCount, setVisibleCount] = useState(2);

  const { data: seasonDetails, isLoading, isError } = useGetTVSeasonDetailsQuery({
    tvId,
    seasonNumber: selectedSeason
  });

  const handleSeasonChange = (num: number) => {
    setSelectedSeason(num);
    setVisibleCount(2);
  };

  const handleShowLess = () => {
    setVisibleCount(2);
    const element = document.getElementById('seasons-section');
    if (element) {
      const offset = 100; // Offset for header/navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="seasons-section" className="space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Seasons & Episodes
        </h2>
        
        <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] hidden md:block">
          {sortedSeasons.length} Seasons Available
        </div>
      </div>

      {/* Season Selector */}
      <ScrollContainer 
        className="gap-2.5 pb-2" 
        size="sm"
      >
        {sortedSeasons.map((season) => (
          <button
            key={season.id}
            onClick={() => handleSeasonChange(season.season_number)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap border flex-shrink-0 flex items-center gap-2",
              selectedSeason === season.season_number
                ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            {season.name}
            <span className={clsx(
              "text-[10px] px-1.5 py-0.5 rounded-md",
              selectedSeason === season.season_number
                ? "bg-white/20 text-white"
                : "bg-white/10 text-muted-foreground"
            )}>
              {season.episode_count}
            </span>
          </button>
        ))}
      </ScrollContainer>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-muted-foreground">Failed to load episode details.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-4"
            >
              {seasonDetails?.episodes.slice(0, visibleCount).map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </motion.div>

            {seasonDetails?.episodes && seasonDetails.episodes.length > 2 && (
              <div className="flex flex-col md:flex-row gap-3">
                {visibleCount < seasonDetails.episodes.length && (
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 10, seasonDetails.episodes.length))}
                    className="flex-1 py-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-xs font-black text-brand-primary uppercase tracking-[0.2em] hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all flex items-center justify-center gap-2 group"
                  >
                    Load More (+10)
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                )}

                {visibleCount > 2 && (
                  <button
                    onClick={handleShowLess}
                    className={clsx(
                      "py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-muted-foreground uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group px-8",
                      visibleCount >= seasonDetails.episodes.length ? "flex-1" : "w-auto"
                    )}
                  >
                    View Less
                    <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};


export default TVSeasons;
