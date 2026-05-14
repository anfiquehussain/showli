import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronRight } from 'lucide-react';
import { useGetMediaVideosQuery } from '@/api/media/mediaApi';
import ScrollContainer from '@/components/patterns/ScrollContainer';

const ITEMS_PER_PAGE = 24;

interface MediaVideosProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaVideos = ({ id, type }: MediaVideosProps) => {
  const { data: videoData, isLoading } = useGetMediaVideosQuery({ id, type });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Reset visible count when modal closes
  useEffect(() => {
    if (!isViewAllOpen) {
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [isViewAllOpen]);

  // Filter for YouTube trailers and teasers - calculated safely
  const allVideos = videoData?.results
    ?.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip')) || [];

  const previewVideos = allVideos.slice(0, 8);
  const displayedVideos = allVideos.slice(0, visibleCount);
  const hasMore = visibleCount < allVideos.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore) {
        handleLoadMore();
      }
    }, { rootMargin: '400px' });

    if (node) observer.current.observe(node);
  }, [hasMore, handleLoadMore]);

  if (isLoading || !videoData || allVideos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Trailers & Clips
        </h2>

        {allVideos.length > 8 && (
          <button
            onClick={() => setIsViewAllOpen(true)}
            className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
          >
            View All ({allVideos.length})
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <ScrollContainer className="gap-3 md:gap-4 pb-4">
        {previewVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="relative shrink-0 w-[200px] md:w-[320px] aspect-video rounded-xl overflow-hidden border border-white/5 group cursor-pointer shadow-lg"
            onClick={() => setActiveVideo(video.key)}
          >
            {/* Thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
              alt={video.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-80"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
              }}
            />

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-brand-primary/90 flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-110 active:scale-95">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>

            {/* Title & Info */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-brand-secondary transition-colors">
                {video.name}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mt-0.5">
                {video.type}
              </p>
            </div>
          </motion.div>
        ))}
      </ScrollContainer>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 2. View All Modal */}
      <AnimatePresence>
        {isViewAllOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 md:px-8 h-full flex flex-col py-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-heading font-black text-white">All Trailers & Clips</h2>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{allVideos.length} Videos available</p>
                </div>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-12">
                  {displayedVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/5 group cursor-pointer shadow-lg"
                      onClick={() => {
                        setActiveVideo(video.key);
                        // We keep the gallery open behind the player or close it?
                        // Let's close it to keep the UI clean if they play from here
                        setIsViewAllOpen(false);
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                        alt={video.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/90 flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-[10px] font-bold text-white line-clamp-1">{video.name}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/50 mt-0.5">{video.type}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div ref={observerTarget} className="w-full h-32 flex items-center justify-center pb-12">
                    <div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaVideos;
