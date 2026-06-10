import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setUser } from '@/store/slices/authSlice';
import { fetchFavorites, removeUserFavorite } from '@/store/slices/profileSlice';
import { collectionsService } from '@/api/collections/collectionsService';
import { discussionsService } from '@/api/discussions/discussionsService';
import { profileService } from '@/api/profile/profileService';
import { useToast } from '@/hooks/useToast';

import type { Collection } from '@/types/collections.types';
import type { Comment } from '@/types/discussions.types';

export const useProfilePage = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  // Reset loading states when uid changes directly in render to avoid effect cascading
  const [prevUid, setPrevUid] = useState(user?.uid);
  if (user?.uid !== prevUid) {
    setPrevUid(user?.uid);
    setIsLoadingCollections(!!user?.uid);
    setIsLoadingReviews(!!user?.uid);
    setIsLoadingProfile(!!user?.uid);
  }

  // Fetch Favorites
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFavorites(user.uid));
    }
  }, [user?.uid, dispatch]);

  // Fetch Collections
  useEffect(() => {
    if (!user?.uid) return;

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

  return {
    user,
    logout,
    navigate,
    favorites,
    collections,
    reviews,
    bio,
    location,
    favoriteGenre,
    photoURL,
    bannerURL,
    isLoadingCollections,
    isLoadingReviews,
    isLoadingProfile,
    isAddModalOpen,
    setIsAddModalOpen,
    isAllReviewsOpen,
    setIsAllReviewsOpen,
    isEditProfileOpen,
    setIsEditProfileOpen,
    handleSaveProfile,
    handleRemoveFavorite,
  };
};
