import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tv } from 'lucide-react';
import { useGetTVSeasonDetailsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

interface EpisodeNavigationProps {
  tvId: number;
  seasonNumber: number;
  episodeNumber: number;
}

const EpisodeNavigation = ({ tvId, seasonNumber, episodeNumber }: EpisodeNavigationProps) => {
  // Fetch season details to determine adjacent episodes
  const { data: seasonDetails } = useGetTVSeasonDetailsQuery({
    tvId,
    seasonNumber,
  });

  const episodes = seasonDetails?.episodes || [];
  const currentIdx = episodes.findIndex((ep) => ep.episode_number === episodeNumber);

  const prevEpisode = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEpisode = currentIdx !== -1 && currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      {/* Back Links header */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-white/5">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Episode Navigation</h2>
        
        <div className="flex items-center gap-3">
          <Link 
            to={`/tv/${tvId}`} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 text-[10px] font-black text-white/80 hover:text-brand-primary uppercase tracking-wider transition-all duration-300 transform active:scale-95"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Series Details</span>
          </Link>
        </div>
      </div>

      {/* Prev & Next Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Episode Card */}
        {prevEpisode ? (
          <Link 
            to={`/tv/${tvId}/season/${seasonNumber}/episode/${prevEpisode.episode_number}`}
            className="group flex gap-4 p-3 bg-white/3 hover:bg-white/6 border border-white/10 rounded-2xl transition-all duration-300 text-left"
          >
            <div className="relative shrink-0 w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-white/5 self-center">
              {prevEpisode.still_path ? (
                <img 
                  src={getTmdbImageUrl(prevEpisode.still_path, 'w185')} 
                  alt={prevEpisode.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
                  No Image
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                <span>Prev — Ep {prevEpisode.episode_number}</span>
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                {prevEpisode.name}
              </h4>
              {prevEpisode.air_date && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {new Date(prevEpisode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <div className="p-4 bg-white/1 border border-white/5 rounded-2xl flex items-center justify-center text-xs text-muted-foreground font-semibold">
            First Episode of the Season
          </div>
        )}

        {/* Next Episode Card */}
        {nextEpisode ? (
          <Link 
            to={`/tv/${tvId}/season/${seasonNumber}/episode/${nextEpisode.episode_number}`}
            className="group flex gap-4 p-3 bg-white/3 hover:bg-white/6 border border-white/10 rounded-2xl transition-all duration-300 text-left"
          >
            <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary flex items-center gap-1 justify-end md:justify-start">
                <span>Next — Ep {nextEpisode.episode_number}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors truncate md:text-left text-right">
                {nextEpisode.name}
              </h4>
              {nextEpisode.air_date && (
                <span className="text-[10px] text-muted-foreground font-medium md:text-left text-right">
                  {new Date(nextEpisode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="relative shrink-0 w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-white/5 self-center order-first md:order-last">
              {nextEpisode.still_path ? (
                <img 
                  src={getTmdbImageUrl(nextEpisode.still_path, 'w185')} 
                  alt={nextEpisode.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
                  No Image
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="p-4 bg-white/1 border border-white/5 rounded-2xl flex items-center justify-center text-xs text-muted-foreground font-semibold">
            Last Episode of the Season
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeNavigation;
