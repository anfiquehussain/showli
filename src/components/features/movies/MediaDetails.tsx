import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, Globe, Play, Plus, Share2, ChevronLeft } from 'lucide-react';
import { useGetMovieDetailsQuery, useGetTVDetailsQuery } from '@/api/tmdb/tmdbApi';
import { getTmdbImageUrl, HERO_BACKDROP_SIZE } from '@/utils/image';
import Button from '@/components/ui/Button';
import { AddToCollectionModal } from '@/components/features/collections/AddToCollectionModal';
import type { 
  TmdbMovieDetails, 
  TmdbTVDetails 
} from '@/types/tmdb.types';

interface MediaDetailsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaDetails = ({ id, type }: MediaDetailsProps) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const movieQuery = useGetMovieDetailsQuery(id, { skip: type !== 'movie' });
  const tvQuery = useGetTVDetailsQuery(id, { skip: type !== 'tv' });

  const { data: media, isLoading, isError } = type === 'movie' ? movieQuery : tvQuery;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] bg-card/50 animate-pulse rounded-3xl" />
    );
  }

  if (isError || !media) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-error">Failed to load details.</h2>
      </div>
    );
  }

  const title = 'title' in media ? media.title : media.name;
  const date = 'release_date' in media ? media.release_date : media.first_air_date;
  
  // Extract runtime (Movie has runtime, TV has average episode runtime)
  const runtime = type === 'movie' 
    ? (media as TmdbMovieDetails).runtime 
    : (media as TmdbTVDetails).episode_run_time?.[0] || null;
  
  return (
    <div className="space-y-10 md:space-y-16 pb-20">
      {/* Hero Header Section */}
      <section className="relative w-full h-[60vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh] min-h-[450px] overflow-hidden rounded-3xl group">
        <div className="absolute inset-0">
          <img
            src={getTmdbImageUrl(media.backdrop_path, HERO_BACKDROP_SIZE)}
            alt={title}
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent hidden md:block" />
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-8 md:left-8 p-2.5 rounded-full bg-background/30 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all text-white z-10 shadow-xl active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl space-y-4 md:space-y-8"
          >
            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20">
                <Star className="w-3 h-3 fill-current" />
                <span>{media.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm font-semibold backdrop-blur-md bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{date?.split('-')[0]}</span>
              </div>
              {runtime && (
                <div className="flex items-center gap-1.5 text-white/80 text-xs md:text-sm font-semibold backdrop-blur-md bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>{runtime} min</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-tight leading-[1.1] text-pretty">
              {title}
            </h1>

            <p className="text-sm md:text-lg text-white/70 max-w-2xl leading-relaxed text-pretty line-clamp-3 md:line-clamp-none font-medium">
              {media.overview}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-5 pt-4 md:pt-6">
              <Button variant="primary" size="lg" className="gap-2.5 px-8 h-12 md:h-14 text-sm md:text-base font-bold shadow-xl shadow-brand-primary/20">
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <span>Watch Now</span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="gap-2.5 glass-card px-6 h-12 md:h-14 text-sm md:text-base font-bold"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span>Add to Collection</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 space-y-10 md:space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-brand-primary rounded-full" />
              Storyline
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-xl font-medium">
              {media.overview}
            </p>
          </section>
          
          {/* Casting / Seasons Placeholder */}
          {type === 'tv' && (media as TmdbTVDetails).number_of_seasons && (
            <section className="space-y-4 pt-4">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-8 bg-brand-secondary rounded-full" />
                Series Info
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-white/5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Seasons</span>
                  <p className="text-xl font-bold text-white">{(media as TmdbTVDetails).number_of_seasons}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-white/5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Episodes</span>
                  <p className="text-xl font-bold text-white">{(media as TmdbTVDetails).number_of_episodes}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-white/5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Type</span>
                  <p className="text-xl font-bold text-white">{(media as TmdbTVDetails).type}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-white/5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                  <p className="text-xl font-bold text-white">{media.status}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/5 space-y-8 sticky top-24">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-secondary" />
              Information
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground group-hover:text-white transition-colors">Status</span>
                <span className="text-white font-semibold bg-white/5 px-3 py-1 rounded-lg border border-white/5">{media.status}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground group-hover:text-white transition-colors">Popularity</span>
                <span className="text-white font-semibold bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                  {media.popularity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="space-y-3">
                <span className="text-muted-foreground block">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {media.genres.map(genre => (
                    <span key={genre.id} className="px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-xs font-bold text-brand-primary">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground group-hover:text-white transition-colors">Language</span>
                <span className="text-white font-semibold uppercase">{media.original_language}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground group-hover:text-white transition-colors">Total Votes</span>
                <span className="text-white font-semibold">{media.vote_count.toLocaleString()}</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <Share2 className="w-4 h-4" />
              <span>Share Media</span>
            </Button>
          </div>
        </aside>
      </div>


      {media && (
        <AddToCollectionModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          media={media} 
        />
      )}
    </div>
  );
};

export default MediaDetails;
