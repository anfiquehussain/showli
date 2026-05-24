import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MessageSquare, ChevronRight, Film, User, Mail, MapPin, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '@/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setUser } from '@/store/slices/authSlice';
import { fetchFavorites, removeUserFavorite } from '@/store/slices/profileSlice';
import { collectionsService } from '@/api/collections/collectionsService';
import { discussionsService } from '@/api/discussions/discussionsService';
import { profileService } from '@/api/profile/profileService';
import { useToast } from '@/hooks/useToast';

// Components
import ProfileHero from '@/components/features/profile/ProfileHero';
import ProfileFavorites from '@/components/features/profile/ProfileFavorites';
import AddFavoriteModal from '@/components/features/profile/AddFavoriteModal';
import EditProfileModal from '@/components/features/profile/EditProfileModal';
import ProfileSection from '@/components/features/profile/ProfileSection';
import AllReviewsModal from '@/components/features/profile/AllReviewsModal';
import ProfileReviewCard from '@/components/features/profile/ProfileReviewCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

// Types
import type { Collection } from '@/types/collections.types';
import type { Comment } from '@/types/discussions.types';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const joinedDate = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'N/A';

  const toast = useToast();

  // State
  const { favorites } = useAppSelector((state) => state.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [reviews, setReviews] = useState<Comment[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);

  // Profile Details State
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bannerURL, setBannerURL] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Fetch Favorites
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFavorites(user.uid));
    }
  }, [user?.uid, dispatch]);

  // Fetch Collections
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingCollections(true);

    const loadCollections = async () => {
      try {
        const userCollections = await collectionsService.getCollections(user.uid);
        setCollections(userCollections);
      } catch (error) {
        console.error('Failed to load collections:', error);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    loadCollections();
  }, [user?.uid]);

  // Subscribe to User Reviews in Real-time
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingReviews(true);

    const unsubscribe = discussionsService.subscribeToUserReviews(
      user.uid,
      (reviewsList) => {
        // Filter top-level reviews and sort by newest in memory to avoid Firestore index requirement
        const userReviews = [...reviewsList]
          .filter((review) => review.parentId === null && review.rating !== null)
          .sort((a, b) => b.createdAt - a.createdAt);
        setReviews(userReviews);
        setIsLoadingReviews(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch Profile Details from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingProfile(true);

    const loadProfileDetails = async () => {
      try {
        const details = await profileService.getProfileDetails(user.uid);
        setBio(details.bio || '');
        setLocation(details.location || '');
        setFavoriteGenre(details.favoriteGenre || '');
        setPhotoURL(details.photoURL || '');
        setBannerURL(details.bannerURL || '');
      } catch (error) {
        console.error('Failed to load profile details:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileDetails();
  }, [user?.uid]);

  // Actions
  const handleSaveProfile = async (details: {
    displayName: string;
    bio: string;
    location: string;
    favoriteGenre: string;
    photoURL: string;
    bannerURL: string;
  }) => {
    if (!user?.uid) return;
    
    try {
      // Save to Firestore & Firebase Auth
      await profileService.updateProfileDetails(user.uid, details);
      
      // Update local states
      setBio(details.bio);
      setLocation(details.location);
      setFavoriteGenre(details.favoriteGenre);
      setPhotoURL(details.photoURL);
      setBannerURL(details.bannerURL);
      
      // Update Redux state to sync globally
      dispatch(setUser({
        ...user,
        displayName: details.displayName,
        photoURL: details.photoURL || null,
      }));

      // Display success feedback toast
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile details:', error);
      throw error;
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    if (!user?.uid) return;
    try {
      await dispatch(removeUserFavorite({ uid: user.uid, mediaId: id })).unwrap();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Redesigned Banner & User Info Header */}
      <ProfileHero
        user={user}
        collectionsCount={collections.length}
        reviewsCount={reviews.length}
        favoritesCount={favorites.length}
        bannerURL={bannerURL}
        onLogout={logout}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* 2. Bottom Split Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: About Me / User Details */}
        <div className="lg:col-span-1 h-fit animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <ProfileSection
            title="User Details"
            icon={<User className="w-4 h-4" />}
            action={
              <Button
                variant="secondary"
                size="sm"
                className="h-7 rounded-lg text-[10px] font-bold uppercase tracking-wider gap-1.5 px-2.5 bg-white/5 hover:bg-white/10 border-white/5"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Settings className="w-3 h-3 text-muted-foreground" />
                Edit
              </Button>
            }
            className="glass-card p-4 md:p-5 rounded-2xl border border-white/5 space-y-4"
          >
            <div className="space-y-4">
              {/* Bio Field */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bio</span>
                {isLoadingProfile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-4 w-1/2 bg-white/5" />
                  </div>
                ) : (
                  <p className="text-sm text-white/95 leading-relaxed font-medium">
                    {bio || "No bio added yet."}
                  </p>
                )}
              </div>

              <div className="w-full h-px bg-white/5" />

              {/* Info Details List */}
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Email Address</p>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Joined */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4.5 h-4.5 text-brand-secondary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Member Since</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{joinedDate}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4.5 h-4.5 text-brand-accent shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Location</p>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {isLoadingProfile ? <Skeleton className="h-4.5 w-24 bg-white/5" /> : (location || 'Not Specified')}
                    </div>
                  </div>
                </div>

                {/* Fav Genre */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Film className="w-4.5 h-4.5 text-warning shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Favorite Genre</p>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {isLoadingProfile ? <Skeleton className="h-4.5 w-28 bg-white/5" /> : (favoriteGenre || 'Not Specified')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ProfileSection>
        </div>

        {/* Right Side: Favorites, Collections, and Reviews */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
          {/* Favorites List */}
          <ProfileFavorites
            favorites={favorites}
            onAdd={() => setIsAddModalOpen(true)}
            onRemove={handleRemoveFavorite}
          />

          {/* Grid for Collections and Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* My Collections */}
            <ProfileSection
              title="My Collections"
              icon={<Layers className="w-4 h-4" />}
              className="glass-card p-4 md:p-5 rounded-2xl border border-white/5 space-y-4"
            >
              {isLoadingCollections ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : collections.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 bg-white/5 border border-dashed border-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">No collections yet</p>
                    <p className="text-[11px] text-muted-foreground max-w-[220px] mx-auto">Create lists to organize your movies and TV shows!</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md px-2.5"
                    onClick={() => navigate('/collections')}
                  >
                    Create Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {collections.slice(0, 3).map((collection) => (
                      <div
                        key={collection.id}
                        onClick={() => navigate(`/collections/${collection.id}`)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-standard cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-card border border-white/10 shrink-0 flex items-center justify-center text-brand-secondary group-hover:scale-105 transition-standard">
                            <Layers className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-brand-primary transition-standard">
                              {collection.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {collection.media_count} {collection.media_count === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-primary group-hover:translate-x-1 transition-standard" />
                      </div>
                    ))}
                  </div>

                  {collections.length > 3 && (
                    <Button
                      variant="secondary"
                      className="w-full h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5 bg-white/3 border-white/5 hover:bg-white/5 mt-1.5 rounded-lg"
                      onClick={() => navigate('/collections')}
                    >
                      View All Collections
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </ProfileSection>

            {/* My Reviews */}
            <ProfileSection
              title="My Reviews"
              icon={<MessageSquare className="w-4 h-4" />}
              className="glass-card p-4 md:p-5 rounded-2xl border border-white/5 space-y-4"
            >
              {isLoadingReviews ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 bg-white/5 border border-dashed border-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">No reviews written</p>
                    <p className="text-[11px] text-muted-foreground max-w-[220px] mx-auto">Share your cinematic ratings and thoughts with the community!</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md px-2.5"
                    onClick={() => navigate('/browse')}
                  >
                    Browse Titles
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <ProfileReviewCard
                        key={review.id}
                        review={review}
                        size="sm"
                      />
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <Button
                      variant="secondary"
                      className="w-full h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5 bg-white/3 border-white/5 hover:bg-white/5 mt-1.5 rounded-lg"
                      onClick={() => setIsAllReviewsOpen(true)}
                    >
                      View All Reviews
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </ProfileSection>
          </div>
        </div>
      </div>

      {/* Add Favorite Modal */}
      <AddFavoriteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* All Reviews Modal */}
      <AllReviewsModal 
        isOpen={isAllReviewsOpen} 
        onClose={() => setIsAllReviewsOpen(false)} 
        reviews={reviews} 
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentDisplayName={user?.displayName}
        currentBio={bio}
        currentLocation={location}
        currentFavoriteGenre={favoriteGenre}
        currentPhotoURL={photoURL}
        currentBannerURL={bannerURL}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
