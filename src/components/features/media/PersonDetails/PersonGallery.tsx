import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Maximize2 } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import ScrollContainer from '@/components/patterns/ScrollContainer';
import type { TmdbImage, TmdbMedia } from '@/types/tmdb.types';
import { useGetPersonTaggedImagesQuery } from '@/api/media/mediaApi';

interface PersonGalleryProps {
  personId: number;
  profileImages?: TmdbImage[];
}

const PersonGallery = ({ personId, profileImages = [] }: PersonGalleryProps) => {
  const [page, setPage] = useState(1);
  const { data: taggedImagesData, isFetching } = useGetPersonTaggedImagesQuery({ id: personId, page });
  const taggedImages = taggedImagesData?.results || [];
  const [activeTab, setActiveTab] = useState<'profiles' | 'tagged'>(
    profileImages.length > 0 ? 'profiles' : 'tagged'
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const currentImages = activeTab === 'profiles' ? profileImages : taggedImages;

  const hasMore = (taggedImagesData?.page || 1) < (taggedImagesData?.total_pages || 1);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

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

  // Keyboard navigation for lightbox
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

  if (taggedImages.length === 0 && profileImages.length === 0) return null;

  const previewImages = currentImages.slice(0, 10);

  const handleNext = () => {
    setSelectedIndex(prev => (prev !== null && prev < currentImages.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : currentImages.length - 1));
  };

  const selectedImage = selectedIndex !== null ? currentImages[selectedIndex] : null;

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
              onClick={() => { setActiveTab('profiles'); setSelectedIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'profiles'
                  ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-muted-foreground hover:text-white'
                }`}
            >
              Profiles ({profileImages.length})
            </button>
            <button
              onClick={() => { setActiveTab('tagged'); setSelectedIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tagged'
                  ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-muted-foreground hover:text-white'
                }`}
            >
              Tagged ({taggedImages.length})
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

      <ScrollContainer className="gap-4 pb-4">
        {previewImages.map((image, index) => (
          <div 
            key={`${image.file_path}-${index}`}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 group/image relative overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer ${
              activeTab === 'tagged' ? 'aspect-video w-64 md:w-80' : 'aspect-[2/3] w-32 md:w-44'
            }`}
          >
            <img
              src={getTmdbImageUrl(image.file_path, activeTab === 'tagged' ? 'w780' : 'h632')}
              alt={activeTab}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 scale-90 group-hover/image:scale-100 transition-transform duration-300">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>

            {activeTab === 'tagged' && 'media' in image && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity">
                {(() => {
                  const media = (image as any).media as TmdbMedia;
                  return (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-0.5">
                        {media.media_type}
                      </p>
                      <p className="text-white text-[10px] font-bold truncate">
                        {'title' in media ? media.title : media.name}
                      </p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </ScrollContainer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

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

            <motion.div
              key={selectedImage.file_path}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-7xl max-h-[85vh] w-full ${activeTab === 'tagged' ? 'aspect-video' : 'aspect-[2/3]'}`}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={getTmdbImageUrl(selectedImage.file_path, 'original')}
                alt="Full sized gallery image"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 text-[10px] font-bold uppercase tracking-widest text-center w-full">
                {activeTab === 'tagged' && 'media' in selectedImage && (
                  <>
                    {(() => {
                      const media = (selectedImage as any).media as TmdbMedia;
                      return (
                        <p className="text-white">
                          {'title' in media ? media.title : media.name}
                        </p>
                      );
                    })()}
                  </>
                )}
                <div className="flex items-center gap-4">
                  <span>{selectedIndex !== null ? selectedIndex + 1 : 0} / {currentImages.length}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{selectedImage.width} × {selectedImage.height}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Gallery Modal */}
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
                  <h2 className="text-2xl font-heading font-black text-white">{activeTab === 'profiles' ? 'Profile Images' : 'Tagged Images'}</h2>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{currentImages.length} images available</p>
                </div>
                <button
                  onClick={() => setIsViewAllOpen(false)}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className={`grid gap-4 md:gap-6 pb-12 ${activeTab === 'tagged' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
                  {currentImages.map((image, index) => (
                    <motion.div
                      key={image.file_path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`relative rounded-xl overflow-hidden border border-white/5 group cursor-pointer ${activeTab === 'tagged' ? 'aspect-video' : 'aspect-[2/3]'}`}
                      onClick={() => {
                        setSelectedIndex(index);
                        setIsViewAllOpen(false);
                      }}
                    >
                      <img
                        src={getTmdbImageUrl(image.file_path, 'w500')}
                        alt="Gallery image"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {activeTab === 'tagged' && hasMore && (
                  <div ref={observerTarget} className="w-full h-20 flex items-center justify-center pb-12">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
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

export default PersonGallery;
