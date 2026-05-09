import { useState, useEffect, useRef } from 'react';
import { Star, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { TmdbEpisode } from '@/types/tmdb.types';
import { getTmdbImageUrl } from '@/utils/image';

interface EpisodeCardProps {
  episode: TmdbEpisode;
}

const EpisodeCard = ({ episode }: EpisodeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Check if scrollHeight > clientHeight to detect truncation
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [episode.overview]);

  return (
    <div className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
      <div className="p-3 flex flex-col md:flex-row gap-4">
        {/* Still Image */}
        <div className="relative flex-shrink-0 w-full md:w-40 aspect-video rounded-xl overflow-hidden bg-white/5">
          {episode.still_path ? (
            <img
              src={getTmdbImageUrl(episode.still_path, 'w300')}
              alt={episode.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs">No Preview</span>
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md border border-white/10">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">
              Ep {episode.episode_number}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm md:text-base font-bold text-white group-hover:text-brand-primary transition-colors truncate">
              {episode.name}
            </h3>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-brand-primary/10 rounded-md border border-brand-primary/20 flex-shrink-0">
              <Star className="w-2.5 h-2.5 text-brand-primary fill-brand-primary" />
              <span className="text-[10px] font-black text-brand-primary">
                {episode.vote_average?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-bold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 opacity-60" />
              {episode.air_date ? new Date(episode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
            </div>
            {episode.runtime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                {episode.runtime} min
              </div>
            )}
            {episode.episode_type && episode.episode_type !== 'standard' && (
              <div className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded border border-brand-primary/20 uppercase tracking-tighter text-[9px]">
                {episode.episode_type}
              </div>
            )}
          </div>

          <div className="relative">
            <p 
              ref={textRef}
              className={clsx(
                "text-[13px] text-muted-foreground/80 leading-relaxed font-medium transition-all duration-300",
                !isDescExpanded && "line-clamp-2"
              )}
            >
              {episode.overview || "No overview available for this episode."}
            </p>
            {isOverflowing && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-brand-primary font-black text-[10px] uppercase tracking-wider mt-1.5 hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                {isDescExpanded ? (
                  <>Read Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read More <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>

          {((episode.crew && episode.crew.length > 0) || (episode.guest_stars && episode.guest_stars.length > 0)) && (
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-brand-primary text-xs font-black flex items-center gap-1.5 hover:opacity-80 transition-opacity uppercase tracking-wider mt-1"
             >
               {isExpanded ? (
                 <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
               ) : (
                 <>Details & Cast <ChevronDown className="w-3.5 h-3.5" /></>
               )}
             </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-white/[0.02] border-t border-white/5"
          >
            <div className="p-5 space-y-5">
              {/* Cast/Guests */}
              {episode.guest_stars && episode.guest_stars.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Guest Stars</h4>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {episode.guest_stars.map((star) => (
                      <div key={star.id} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/5 transition-colors">
                        {star.profile_path ? (
                          <img 
                            src={getTmdbImageUrl(star.profile_path, 'w45')}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                            alt={star.name}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Star className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{star.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{star.character}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew */}
              {episode.crew && episode.crew.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Key Crew</h4>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {episode.crew.filter((c) => ['Director', 'Writer', 'Teleplay', 'Story'].includes(c.job || '')).map((person) => (
                      <div key={person.id + (person.job || '')} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/5 transition-colors">
                        {person.profile_path ? (
                          <img 
                            src={getTmdbImageUrl(person.profile_path, 'w45')}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                            alt={person.name}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Star className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{person.name}</span>
                          <span className="text-[10px] text-brand-primary font-black uppercase tracking-tight">{person.job}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EpisodeCard;
