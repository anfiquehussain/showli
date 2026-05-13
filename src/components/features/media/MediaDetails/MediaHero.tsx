import { motion } from 'framer-motion';
import { Star, Clock, Globe, Plus, Share2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import Button from '@/components/ui/Button';
import type { TmdbMovieDetails, TmdbTVDetails } from '@/types/tmdb.types';

interface MediaHeroProps {
  media: TmdbMovieDetails | TmdbTVDetails;
  type: 'movie' | 'tv';
  title: string;
  year: string | undefined;
  runtime: number | null;
  tagline: string | null;
  onAddToCollection?: () => void;
}

const MediaHero = ({ 
  media, 
  type, 
  title, 
  year, 
  runtime, 
  tagline, 
  onAddToCollection 
}: MediaHeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
      {/* Background Backdrop Layer */}
      <div className="absolute inset-0 w-full h-[85%] overflow-hidden">
        <img
          src={getTmdbImageUrl(media.backdrop_path || media.poster_path, 'original')}
          alt=""
          className="w-full h-full object-cover object-top opacity-100 blur-[1px] scale-100"
          aria-hidden="true"
        />
        {/* Complex Fading Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/20 hidden md:block" />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
      </div>

      {/* Back Button - Floating */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-white z-30 shadow-lg active:scale-95"
        aria-label="Go back"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Identity & Poster Container */}
      <div className="container mx-auto px-4 md:px-8 relative z-20 pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
          {/* Poster Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative shrink-0 w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 group/poster"
          >
            <img
              src={getTmdbImageUrl(media.poster_path || media.backdrop_path, 'w500')}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300" />
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
                <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-primary rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-primary/20">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>{media.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                  {type === 'movie' ? year : 'TV Series'}
                </div>
                {runtime && (
                  <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{runtime} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10 uppercase">
                  {media.status}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-white tracking-tight leading-tight text-pretty">
                {title}
              </h1>
              
              {tagline && (
                <p className="text-sm md:text-base text-brand-secondary italic font-medium opacity-90 leading-tight">
                  "{tagline}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              {media.genres.map(genre => (
                <span key={genre.id} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-none gap-1.5 glass-card px-2.5 sm:px-3.5 h-8 sm:h-9 text-[10px] sm:text-xs font-bold border-white/10 hover:border-white/20"
                onClick={() => onAddToCollection?.()}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collections</span>
                <span className="sm:hidden">Collections</span>
              </Button>
              {media.homepage && (
                <a 
                  href={media.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
                  title="Official Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
              <button 
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: title,
                      text: media.overview,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
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

export default MediaHero;
