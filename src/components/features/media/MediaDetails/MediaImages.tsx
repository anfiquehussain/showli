import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2
} from 'lucide-react';
import { useGetMediaImagesQuery, useGetCollectionImagesQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import ScrollContainer from '@/components/patterns/ScrollContainer';

interface MediaImagesProps {
  id: number;
  type: 'movie' | 'tv';
  collectionId?: number;
}

const MediaImages = ({ id, type, collectionId }: MediaImagesProps) => {
  const [activeTab, setActiveTab] = useState<'backdrops' | 'posters'>('backdrops');
  const { data: images, isLoading } = useGetMediaImagesQuery({ id, type });
  const { data: collectionImages } = useGetCollectionImagesQuery(collectionId!, { skip: !collectionId });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  if (isLoading || !images) return null;

  const allBackdrops = [
    ...(images?.backdrops || []),
    ...(collectionImages?.backdrops || [])
  ].filter((v, i, a) => a.findIndex(t => t.file_path === v.file_path) === i);

  const allPosters = [
    ...(images?.posters || []),
    ...(collectionImages?.posters || [])
  ].filter((v, i, a) => a.findIndex(t => t.file_path === v.file_path) === i);

  const currentImages = activeTab === 'backdrops' ? allBackdrops : allPosters;
  const previewImages = currentImages.slice(0, 10);

  const handleNext = () => {
    setSelectedIndex(prev => (prev !== null && prev < currentImages.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : currentImages.length - 1));
  };

  if (allBackdrops.length === 0 && allPosters.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Media Gallery
          </h2>

          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => { setActiveTab('backdrops'); setSelectedIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'backdrops'
                  ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-muted-foreground hover:text-white'
                }`}
            >
              Backdrops ({allBackdrops.length})
            </button>
            <button
              onClick={() => { setActiveTab('posters'); setSelectedIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'posters'
                  ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-muted-foreground hover:text-white'
                }`}
            >
              Posters ({allPosters.length})
            </button>
          </div>
        </div>

        {currentImages.length > 10 && (
          <button
            onClick={() => setIsViewAllOpen(true)}
            className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
          >
            View All ({currentImages.length})
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <ScrollContainer className="gap-3 md:gap-4 pb-4">
        {previewImages.map((image, index) => (
          <motion.div
            key={image.file_path}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className={`relative shrink-0 rounded-xl overflow-hidden border border-white/5 group/image cursor-pointer ${activeTab === 'backdrops' ? 'w-[240px] md:w-[400px] aspect-video' : 'w-[140px] md:w-[200px] aspect-[2/3]'
              }`}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={getTmdbImageUrl(image.file_path, activeTab === 'backdrops' ? 'w780' : 'w500')}
              alt={`${activeTab === 'backdrops' ? 'Backdrop' : 'Poster'} ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 scale-90 group-hover/image:scale-100 transition-transform duration-300">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="absolute bottom-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <div className="glass-card px-2 py-1 rounded text-[10px] font-bold text-white/80 border-white/10 uppercase tracking-tighter">
                {image.width} × {image.height}
              </div>
            </div>
          </motion.div>
        ))}
      </ScrollContainer>


      {/* 1. Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-all border border-white/10 active:scale-90"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-all border border-white/10 active:scale-90"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <motion.div
              key={currentImages[selectedIndex]?.file_path}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-7xl max-h-[85vh] w-full ${activeTab === 'backdrops' ? 'aspect-video' : 'aspect-[2/3]'
                }`}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={getTmdbImageUrl(currentImages[selectedIndex]?.file_path || '', 'original')}
                alt={`Full ${activeTab === 'backdrops' ? 'Backdrop' : 'Poster'}`}
                className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              />

              {/* Info Overlay */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-widest">
                <span>{selectedIndex + 1} / {currentImages.length}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{currentImages[selectedIndex]?.width} × {currentImages[selectedIndex]?.height}</span>
              </div>
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
                  <h2 className="text-2xl font-heading font-black text-white">Full Gallery</h2>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{allBackdrops.length} Backdrops available</p>
                </div>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className={`grid gap-4 md:gap-6 pb-12 ${activeTab === 'backdrops' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  }`}>
                  {currentImages.map((image, index) => (
                    <motion.div
                      key={image.file_path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`relative rounded-xl overflow-hidden border border-white/5 group cursor-pointer ${activeTab === 'backdrops' ? 'aspect-video' : 'aspect-[2/3]'
                        }`}
                      onClick={() => {
                        setSelectedIndex(index);
                        setIsViewAllOpen(false);
                      }}
                    >
                      <img
                        src={getTmdbImageUrl(image.file_path, 'w500')}
                        alt={`${activeTab === 'backdrops' ? 'Backdrop' : 'Poster'} ${index + 1}`}
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

export default MediaImages;
