import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Users } from 'lucide-react';
import ShowliDiscussion from './ShowliDiscussion';
import TmdbReviews from './TmdbReviews';

interface MediaReviewsSectionProps {
  id: number;
  type: 'movie' | 'tv';
}

type TabType = 'showli' | 'tmdb';

const MediaReviewsSection = ({ id, type }: MediaReviewsSectionProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('showli');

  return (
    <section className="space-y-10 pt-16 border-t border-white/5">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center lg:text-left items-center lg:items-start">
        <div className="space-y-2 flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-3 text-brand-primary">
            <Users className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Community</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight">
            User Discussions
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
            Join the conversation with the Showli community or browse official reviews from TMDb.
          </p>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex p-1 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl w-fit shadow-2xl mx-auto lg:mx-0">
          <button
            onClick={() => setActiveTab('showli')}
            className={`
              relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 uppercase tracking-widest
              ${activeTab === 'showli' ? 'text-white' : 'text-white/30 hover:text-white/50'}
            `}
          >
            {activeTab === 'showli' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg md:rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <MessageSquare className="w-3 md:w-4 h-3 md:h-4 relative z-10" />
            <span className="relative z-10">Showli</span>
          </button>
          <button
            onClick={() => setActiveTab('tmdb')}
            className={`
              relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 uppercase tracking-widest
              ${activeTab === 'tmdb' ? 'text-white' : 'text-white/30 hover:text-white/50'}
            `}
          >
            {activeTab === 'tmdb' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg md:rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Star className="w-3 md:w-4 h-3 md:h-4 relative z-10" />
            <span className="relative z-10">TMDb</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'showli' ? (
            <motion.div
              key="showli"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <ShowliDiscussion mediaId={id} mediaType={type} />
            </motion.div>
          ) : (
            <motion.div
              key="tmdb"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <TmdbReviews mediaId={id} mediaType={type} />
            </motion.div>
          ) }
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MediaReviewsSection;
