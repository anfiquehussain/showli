import { useState, useEffect } from 'react';
import { BookMarked, Layers, MessageSquare, Star } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchFavorites, removeUserFavorite } from '@/store/slices/profileSlice';
import MediaScroll from '@/components/patterns/MediaScroll';
import ProfileHero from '@/components/features/profile/ProfileHero';
import ProfileSidebar from '@/components/features/profile/ProfileSidebar';
import ProfileSection from '@/components/features/profile/ProfileSection';
import ProfileFavorites from '@/components/features/profile/ProfileFavorites';
import AddFavoriteModal from '@/components/features/profile/AddFavoriteModal';
import type { ProfileStats, UserReview } from '@/components/features/profile/profile.types';

// Dummy Data
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
      await dispatch(removeUserFavorite({ uid: user.uid, mediaId: id })).unwrap();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProfileHero user={user} stats={DUMMY_STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 order-2 lg:order-1">
          <ProfileSidebar user={user} onLogout={logout} />
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2 space-y-12">
          <ProfileFavorites 
            favorites={favorites}
            onAdd={() => setIsAddModalOpen(true)}
            onRemove={handleRemoveFavorite}
          />

          <ProfileSection 
            title="My Wishlist" 
            icon={<BookMarked className="w-5 h-5" />}
            onSeeAll={() => {}}
          >
            <MediaScroll title="" icon={null} items={favorites} />
          </ProfileSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileSection title="Collections" icon={<Layers className="w-5 h-5" />} onSeeAll={() => {}}>
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

            <ProfileSection title="Recent Reviews" icon={<MessageSquare className="w-5 h-5" />} onSeeAll={() => {}}>
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
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">"{review.comment}"</p>
                    <p className="text-[10px] text-zinc-500">{review.date}</p>
                  </div>
                ))}
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>

      <AddFavoriteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default ProfilePage;
