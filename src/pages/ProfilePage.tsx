import { useState, useEffect } from 'react';
import { Heart, BookMarked, Layers, Star, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchFavorites, removeUserFavorite } from '@/store/slices/profileSlice';
import MediaScroll from '@/components/patterns/MediaScroll';
import ProfileHero from '@/components/features/profile/ProfileHero';
import ProfileSidebar from '@/components/features/profile/ProfileSidebar';
import ProfileSection from '@/components/features/profile/ProfileSection';
import AddFavoriteModal from '@/components/features/profile/AddFavoriteModal';
import Button from '@/components/ui/Button';
import type { ProfileStats, UserReview } from '@/components/features/profile/profile.types';

// Dummy Data for non-managed parts
const DUMMY_STATS: ProfileStats = {
  moviesWatched: 245,
  listsCreated: 12,
  reviewsWritten: 84,
  followers: 156,
};

const DUMMY_REVIEWS: UserReview[] = [
  {
    id: '1',
    mediaId: 157336,
    mediaTitle: 'Interstellar',
    mediaType: 'movie',
    rating: 5,
    comment: 'An absolute masterpiece of cinema. The visual effects and Hans Zimmer soundtrack create an unparalleled atmosphere.',
    date: '2024-04-15',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlSaba7.jpg',
  },
  {
    id: '2',
    mediaId: 27205,
    mediaTitle: 'Inception',
    mediaType: 'movie',
    rating: 4.5,
    comment: 'Complex, original, and thought-provoking. Christopher Nolan manages to ground a high-concept sci-fi in real emotional weight.',
    date: '2024-03-22',
    posterPath: '/oYu6vS6S9S9C4vF97S9S9S9S9S9.jpg',
  }
];

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector(state => state.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFavorites(user.uid));
    }
  }, [user?.uid, dispatch]);

  const handleRemoveFavorite = async (id: number) => {
    if (!user?.uid) return;
    try {
      await dispatch(removeUserFavorite({ uid: user.uid, movieId: id })).unwrap();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <ProfileHero user={user} stats={DUMMY_STATS} />

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar (Profile Info) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <ProfileSidebar user={user} onLogout={logout} />
        </div>

        {/* Right Content (Movie Info) */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-12">
          {/* Top 5 Favorites */}
          <ProfileSection 
            title="Top 5 Favorites" 
            icon={<Heart className="w-5 h-5" />}
            action={
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider gap-1.5"
                onClick={() => setIsAddModalOpen(true)}
                disabled={favorites.length >= 5}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Media
              </Button>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {favorites.map((movie, index) => {
                  const title = 'title' in movie ? movie.title : movie.name;
                  return (
                    <motion.div 
                      key={movie.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      className="group relative aspect-[2/3] rounded-2xl overflow-hidden glass-card transition-standard hover:border-brand-primary/50 shadow-xl"
                    >
                      <img 
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-standard duration-700"
                      />
                      
                      {/* Ranking Badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                        {index + 1}
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveFavorite(movie.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-error/20 backdrop-blur-md border border-error/20 text-error opacity-0 group-hover:opacity-100 transition-standard hover:bg-error hover:text-white"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
                        <p className="text-xs font-bold text-white truncate">{title}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty Slots */}
              {Array.from({ length: 5 - favorites.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="aspect-[2/3] rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-white/5 hover:border-white/10 transition-standard cursor-pointer"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-6 h-6 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Empty</span>
                </div>
              ))}
            </div>
          </ProfileSection>

          {/* Wishlist */}
          <ProfileSection 
            title="My Wishlist" 
            icon={<BookMarked className="w-5 h-5" />}
            onSeeAll={() => {}}
          >
            <MediaScroll 
              title="" 
              icon={null} 
              items={favorites} // Using same managed data for demo
            />
          </ProfileSection>

          {/* Collections and Reviews row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileSection 
              title="Collections" 
              icon={<Layers className="w-5 h-5" />}
              onSeeAll={() => {}}
            >
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-standard cursor-pointer">
                    <div className="w-16 h-16 rounded-xl bg-card border border-white/10 flex-shrink-0 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-brand-primary transition-standard">
                        {i === 1 ? 'Summer Blockbusters' : 'Oscars 2024 Watchlist'}
                      </h4>
                      <p className="text-xs text-muted-foreground">{i === 1 ? '24 items' : '15 items'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection 
              title="Recent Reviews" 
              icon={<MessageSquare className="w-5 h-5" />}
              onSeeAll={() => {}}
            >
              <div className="space-y-4">
                {DUMMY_REVIEWS.map((review) => (
                  <div key={review.id} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{review.mediaTitle}</h4>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      "{review.comment}"
                    </p>
                    <p className="text-[10px] text-zinc-500">{review.date}</p>
                  </div>
                ))}
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFavoriteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default ProfilePage;
