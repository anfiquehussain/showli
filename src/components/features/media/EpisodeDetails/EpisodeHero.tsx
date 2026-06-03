import { Star, Calendar, Clock, Share2, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import { useToast } from '@/hooks/useToast';
import type { TmdbEpisode, TmdbTVDetails, TmdbImage } from '@/types/tmdb.types';
import { motion } from 'framer-motion';

interface EpisodeHeroProps {
  episode: TmdbEpisode & {
    external_ids?: {
      imdb_id: string | null;
    };
    images?: {
      stills: TmdbImage[];
    };
  };
  show: TmdbTVDetails;
  tvId: number;
}

const EpisodeHero = ({ episode, show, tvId }: EpisodeHeroProps) => {
  const navigate = useNavigate();
  const { success } = useToast();

  const formatSeasonEpisode = (season: number, ep: number) => {
    const s = season < 10 ? `0${season}` : season;
    const e = ep < 10 ? `0${ep}` : ep;
    return `S${s}E${e}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${show.name} — ${episode.name}`,
        text: episode.overview,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  const secondStill = episode.images?.stills?.[1]?.file_path;
  const firstStill = episode.images?.stills?.[0]?.file_path;
  const bannerImage = secondStill || firstStill || show.poster_path || show.backdrop_path || episode.still_path;

  return (
    <section className="relative w-full min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
      {/* Background Backdrop Layer */}
      <div className="absolute inset-0 w-full h-[85%] overflow-hidden">
        <img
          src={getTmdbImageUrl(bannerImage, 'original')}
          alt=""
          className="w-full h-full object-cover object-center opacity-100 blur-[1px] scale-100"
          aria-hidden="true"
        />
        {/* Complex Fading Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background/20 hidden md:block" />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
      </div>

      {/* Back Button - Floating */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors text-white z-30 shadow-lg active:scale-95 cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Identity & Poster Container */}
      <div className="relative z-20 pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
          {/* Episode Still Poster Card Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative shrink-0 group/poster"
          >
            {/* Image card with overflow-hidden */}
            <div className="w-44 sm:w-56 md:w-72 aspect-video rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 relative bg-white/5">
              <img
                src={getTmdbImageUrl(episode.still_path || show.poster_path, 'w500')}
                alt={episode.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Circular User Like Percentage overlaying at bottom-left */}
            {episode.vote_average !== undefined && episode.vote_average > 0 && (
              <div 
                className="absolute -bottom-3 -left-3 z-30 w-11 h-11 md:w-13 md:h-13 bg-zinc-950 rounded-full border border-white/10 flex items-center justify-center p-1 shadow-2xl transition-transform duration-300 hover:scale-110 select-none"
                title={`User Score: ${Math.round(episode.vote_average * 10)}% Liked`}
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Track circle */}
                  <circle
                    className="text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  {/* Progress circle */}
                  <circle
                    className="text-success transition-colors duration-500"
                    strokeWidth="3.5"
                    strokeDasharray="100"
                    strokeDashoffset={100 - Math.round(episode.vote_average * 10)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                </svg>
                {/* Centered Percentage Text */}
                <div className="absolute flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] md:text-xs font-black font-heading tracking-tighter">
                    {Math.round(episode.vote_average * 10)}<span className="text-[6px] md:text-[7px] font-bold">%</span>
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Identity Block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 space-y-3 pb-1 md:pb-2 text-center md:text-left w-full"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {/* TMDb Rating Badge */}
                <div 
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-zinc-800/80 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-wider text-white/90 border border-white/5 shadow-lg select-none"
                  title={`TMDb rating: ${episode.vote_average?.toFixed(1) || '0.0'}/10`}
                >
                  <span className="text-warning font-black tracking-widest text-[8px] mr-0.5">TMDb</span>
                  <Star className="w-2.5 h-2.5 fill-warning text-warning" aria-hidden="true" />
                  <span>{episode.vote_average?.toFixed(1) || '0.0'}</span>
                </div>

                {/* Season & Episode Tag */}
                <div className="flex items-center gap-1 text-brand-primary text-[10px] font-bold backdrop-blur-md bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-md font-heading select-none">
                  {formatSeasonEpisode(episode.season_number, episode.episode_number)}
                </div>

                {/* Air Date */}
                {episode.air_date && (
                  <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    <Calendar className="w-2.5 h-2.5 opacity-70" />
                    <span>{new Date(episode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}

                {/* Runtime */}
                {episode.runtime && (
                  <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{episode.runtime} min</span>
                  </div>
                )}
              </div>

              {/* Show Title Header Link */}
              <Link 
                to={`/tv/${tvId}`} 
                className="inline-block text-brand-secondary hover:text-brand-accent italic font-semibold text-xs sm:text-sm tracking-wide transition-colors"
              >
                {show.name}
              </Link>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-white tracking-tight leading-tight text-pretty">
                {episode.name}
              </h1>
            </div>

             {/* Actions (IMDb and Share) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 relative">
              {episode.external_ids?.imdb_id && (
                <a 
                  href={`https://www.imdb.com/title/${episode.external_ids.imdb_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 sm:px-3.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-warning/50 transition-colors text-[10px] sm:text-xs font-black uppercase tracking-widest text-warning flex items-center justify-center h-8 sm:h-9 active:scale-95"
                  title="View on IMDb"
                >
                  IMDb
                </a>
              )}
              {/* Share */}
              <button 
                className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white cursor-pointer"
                onClick={handleShare}
                aria-label="Share episode"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EpisodeHero;
