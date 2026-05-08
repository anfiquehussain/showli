import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetTrendingQuery } from '@/api/media/mediaApi';
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

  const activeMedia = trendingItems[currentIndex];

  if (!activeMedia) {
    return null;
  }


  return (
    <section className="relative w-full h-[45vh] md:h-[75vh] lg:h-[85vh] overflow-hidden rounded-2xl md:rounded-3xl mb-8 md:mb-16 group">
      {/* Background Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMedia.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={getTmdbImageUrl(activeMedia.backdrop_path, HERO_BACKDROP_SIZE)}
            alt={'title' in activeMedia ? activeMedia.title : activeMedia.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 md:via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-12 lg:p-16 pb-12 md:pb-32 lg:pb-40">
        <div className="max-w-3xl space-y-3 md:space-y-6">
          <motion.div
            key={`info-${activeMedia.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-3 md:space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-brand-primary text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full text-white">
                Trending Now
              </span>
              <div className="flex items-center gap-1.5 text-warning font-semibold text-sm md:text-base">
                <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                <span>{activeMedia.vote_average.toFixed(1)}</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight drop-shadow-2xl leading-tight">
              {'title' in activeMedia ? activeMedia.title : activeMedia.name}
            </h1>

            <p className="text-xs md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3 max-w-xl leading-relaxed text-pretty opacity-80">
              {activeMedia.overview}
            </p>

            <div className="flex flex-row items-center gap-2 pt-1 md:pt-4">
              <Button variant="primary" size="sm" className="px-3 md:px-6 md:py-2.5 gap-2 flex-1 sm:flex-initial">
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                <span className="text-[11px] md:text-sm">Trailer</span>
              </Button>
              <Link to={`/${'title' in activeMedia ? 'movie' : 'tv'}/${activeMedia.id}`} className="flex-1 sm:flex-initial">
                <Button variant="secondary" size="sm" className="px-3 md:px-6 md:py-2.5 gap-2 glass-card w-full sm:w-auto justify-center">
                  <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[11px] md:text-sm">Details</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Indicators - Dots for mobile, Thumbnails for md+ */}
      <div className="absolute bottom-6 md:bottom-8 left-0 w-full px-6 md:px-12 lg:px-16">
        {/* Mobile Dots */}
        <div className="flex md:hidden items-center justify-center gap-2">
          {trendingItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Desktop Thumbnails */}
        <div className="hidden md:flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {trendingItems.map((item, index) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIndex(index)}
              className={`
                relative flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300
                ${currentIndex === index ? 'border-brand-primary scale-105 shadow-lg shadow-brand-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
            >
              <img
                src={getTmdbImageUrl(item.backdrop_path, 'w300')}
                alt={'title' in item ? item.title : item.name}
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
