import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Award } from 'lucide-react';
import { clsx } from 'clsx';

import { useGetTVSeasonDetailsQuery } from '@/api/media/mediaApi';
import ScrollContainer from '@/components/patterns/ScrollContainer';

import type { TmdbTVSeasonBrief } from '@/types/tmdb.types';

import EpisodeCard from './EpisodeCard';
import Skeleton from '../../../ui/Skeleton';
import EpisodeRatingsModal from './EpisodeRatingsModal';

interface TVSeasonsProps {
  tvId: number;
  seasons: TmdbTVSeasonBrief[];
  showTitle: string;
}

const TVSeasons = ({ tvId, seasons, showTitle }: TVSeasonsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonParam = searchParams.get('season');
  const parsedSeasonParam = seasonParam ? parseInt(seasonParam, 10) : null;

  // Sort seasons by number, but handle season 0 (Specials) if it exists
  const sortedSeasons = [...seasons].sort((a, b) => a.season_number - b.season_number);
  
  const initialSeason = (() => {
    if (parsedSeasonParam !== null && !isNaN(parsedSeasonParam)) {
      const exists = sortedSeasons.some(s => s.season_number === parsedSeasonParam);
      if (exists) return parsedSeasonParam;
    }
    return sortedSeasons.find(s => s.season_number === 1)?.season_number ?? sortedSeasons[0]?.season_number ?? 0;
  })();

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [visibleCount, setVisibleCount] = useState(2);
  const [isRatingsModalOpen, setIsRatingsModalOpen] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    if (parsedSeasonParam !== null && !isNaN(parsedSeasonParam)) {
      const exists = sortedSeasons.some(s => s.season_number === parsedSeasonParam);
      if (exists && selectedSeason !== parsedSeasonParam) {
        setSelectedSeason(parsedSeasonParam);
        setVisibleCount(2);
      }
    }
  }, [parsedSeasonParam, sortedSeasons, selectedSeason]);

  // Smooth scroll to seasons section if query param and hash are set initially
  useEffect(() => {
    if (parsedSeasonParam !== null && !isNaN(parsedSeasonParam) && window.location.hash === '#seasons-section') {
      const exists = sortedSeasons.some(s => s.season_number === parsedSeasonParam);
      if (exists) {
        const timer = setTimeout(() => {
          const element = document.getElementById('seasons-section');
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.scrollY ?? window.pageYOffset) - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Clean up the hash in the browser address bar so subsequent refreshes don't re-scroll
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [parsedSeasonParam, sortedSeasons]);

  const { data: seasonDetails, isLoading, isError } = useGetTVSeasonDetailsQuery({
    tvId,
    seasonNumber: selectedSeason
  });

  const handleSeasonChange = (num: number) => {
    setSelectedSeason(num);
    setVisibleCount(2);
    setSearchParams(prev => {
      prev.set('season', num.toString());
      return prev;
    }, { replace: true });
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRatingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[10px] sm:text-[11px] font-black text-brand-primary uppercase tracking-wider hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all duration-300 transform active:scale-95 shadow-sm shadow-brand-primary/5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Episode Ratings</span>
          </button>
          
          <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] hidden md:block">
            {sortedSeasons.length} Seasons Available
          </div>
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
              "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap border shrink-0 flex items-center gap-2",
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
              <Skeleton key={i} className="h-32 rounded-2xl" />
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
                <EpisodeCard key={episode.id} episode={episode} tvId={tvId} />
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
      <EpisodeRatingsModal
        tvId={tvId}
        seasons={seasons}
        isOpen={isRatingsModalOpen}
        onClose={() => setIsRatingsModalOpen(false)}
        showTitle={showTitle}
      />
    </section>
  );
};


export default TVSeasons;
