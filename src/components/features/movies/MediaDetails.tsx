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
    <div className="space-y-12 pb-20">
      {/* Hero Header Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-3xl">
        <div className="absolute inset-0">
          <img
            src={getTmdbImageUrl(media.backdrop_path, HERO_BACKDROP_SIZE)}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2.5 rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-white z-10"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl space-y-6"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary rounded-full text-xs font-bold uppercase tracking-wider text-white">
                <Star className="w-3 h-3 fill-current" />
                <span>{media.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>{date?.split('-')[0]}</span>
              </div>
              {runtime && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{runtime} min</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>{media.original_language.toUpperCase()}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
              {media.overview}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button variant="primary" size="lg" className="gap-2 px-8">
                <Play className="w-5 h-5 fill-current" />
                <span>Watch Now</span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="gap-2 glass-card px-6"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                <span>Add to Collection</span>
              </Button>
              <button className="p-3 rounded-full glass-card border border-white/10 hover:bg-white/10 transition-colors text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Storyline</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {media.overview}
            </p>
          </div>
          
          {/* We can add Cast, Crew, and Similar media here later */}
        </div>

        <div className="space-y-8">
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white">Information</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-muted-foreground">Status</span>
                <span className="text-primary font-medium">{media.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-muted-foreground">Popularity</span>
                <span className="text-primary font-medium">{media.popularity.toFixed(0)}</span>
              </div>
              <div className="flex flex-col gap-2 py-2">
                <span className="text-muted-foreground">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {media.genres.map(genre => (
                    <span key={genre.id} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-primary">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-muted-foreground">Original Language</span>
                <span className="text-primary font-medium">{media.original_language.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-muted-foreground">Vote Count</span>
                <span className="text-primary font-medium">{media.vote_count}</span>
              </div>
            </div>
          </div>
        </div>
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
