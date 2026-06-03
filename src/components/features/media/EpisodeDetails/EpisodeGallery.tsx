import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronRight, Maximize2 } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbImage } from '@/types/tmdb.types';
import ScrollContainer from '@/components/patterns/ScrollContainer';

interface EpisodeGalleryProps {
  images?: TmdbImage[];
}

const EpisodeGallery = ({ images = [] }: EpisodeGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  if (images.length === 0) return null;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  };

  const previewImages = images.slice(0, 10);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Media Gallery
        </h2>

        {images.length > 5 && (
          <button
            onClick={() => setIsViewAllOpen(true)}
            className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            View All ({images.length})
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Horizontal Stills Scroll Container */}
      <ScrollContainer className="gap-3 md:gap-4 pb-4">
        {previewImages.map((image, index) => (
          <motion.div
            key={image.file_path}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="relative shrink-0 rounded-xl overflow-hidden border border-white/5 group/image cursor-pointer w-[240px] md:w-[400px] aspect-video"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={getTmdbImageUrl(image.file_path, 'w780') || ''}
              alt={`Episode Still ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 scale-90 group-hover/image:scale-100 transition-transform duration-300">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </ScrollContainer>

      {/* Premium Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl p-4 z-110 flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-colors border border-white/10 active:scale-90 cursor-pointer"
            >
              <span className="text-xl font-bold">←</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-colors border border-white/10 active:scale-90 cursor-pointer"
            >
              <span className="text-xl font-bold">→</span>
            </button>

            {/* Image Container */}
            <motion.div
              key={images[selectedIndex]?.file_path}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[85vh] w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getTmdbImageUrl(images[selectedIndex]?.file_path || '', 'original') || ''}
                alt={`Full Episode Still`}
                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              />

              {/* Info Overlay */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-widest">
                <span>{selectedIndex + 1} / {images.length}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Grid Modal */}
      <AnimatePresence>
        {isViewAllOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 md:px-8 h-full flex flex-col py-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-heading font-black text-white">Full Gallery</h2>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{images.length} Stills available</p>
                </div>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid gap-4 md:gap-6 pb-12 grid-cols-2 lg:grid-cols-3">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.file_path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="relative rounded-xl overflow-hidden border border-white/5 group cursor-pointer aspect-video"
                      onClick={() => {
                        setSelectedIndex(index);
                        setIsViewAllOpen(false);
                      }}
                    >
                      <img
                        src={getTmdbImageUrl(image.file_path, 'w500') || ''}
                        alt={`Still ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default EpisodeGallery;
