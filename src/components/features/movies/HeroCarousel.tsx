import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetTrendingQuery } from '@/api/tmdb/tmdbApi';
import { getTmdbImageUrl, HERO_BACKDROP_SIZE } from '@/utils/image';
import Button from '@/components/ui/Button';

const HeroCarousel = () => {
  const { data, isLoading, isError } = useGetTrendingQuery({ type: 'all' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const trendingItems = data?.results.slice(0, 10) || [];

  useEffect(() => {
    if (trendingItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [trendingItems.length]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] md:h-[75vh] bg-card/50 animate-pulse rounded-3xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    );
  }

  if (isError || trendingItems.length === 0) {
    return null;
  }

  const activeMovie = trendingItems[currentIndex];

  if (!activeMovie) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + trendingItems.length) % trendingItems.length);
  };

  return (
    <section className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden rounded-3xl mb-16 group">
      {/* Background Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={getTmdbImageUrl(activeMovie.backdrop_path, HERO_BACKDROP_SIZE)}
            alt={'title' in activeMovie ? activeMovie.title : activeMovie.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-32 md:pb-40">
        <div className="max-w-3xl space-y-6">
          <motion.div
            key={`info-${activeMovie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-primary text-xs font-bold uppercase tracking-wider rounded-full text-white">
                Trending Now
              </span>
              <div className="flex items-center gap-1.5 text-warning font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{activeMovie.vote_average.toFixed(1)}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight drop-shadow-2xl">
              {'title' in activeMovie ? activeMovie.title : activeMovie.name}
            </h1>

            <p className="text-base text-muted-foreground line-clamp-2 md:line-clamp-3 max-w-xl leading-relaxed text-pretty">
              {activeMovie.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="md" className="gap-2">
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Trailer</span>
              </Button>
              <Link to={`/${'title' in activeMovie ? 'movie' : 'tv'}/${activeMovie.id}`}>
                <Button variant="secondary" size="md" className="gap-2 glass-card">
                  <Info className="w-4 h-4" />
                  <span>Details</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-white"
          aria-label="Previous movie"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-white"
          aria-label="Next movie"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnail List */}
      <div className="absolute bottom-8 left-0 w-full overflow-x-auto no-scrollbar px-8 md:px-16">
        <div className="flex items-center gap-4 min-w-max pb-2">
          {trendingItems.map((movie, index) => (
            <motion.button
              key={movie.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIndex(index)}
              className={`
                relative flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300
                ${currentIndex === index ? 'border-brand-primary scale-105 shadow-lg shadow-brand-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
            >
              <img
                src={getTmdbImageUrl(movie.backdrop_path, 'w300')}
                alt={'title' in movie ? movie.title : movie.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
