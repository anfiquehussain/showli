import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { TmdbMedia } from '@/types/tmdb.types';

const USERS_COLLECTION = 'users';

export interface UserProfileDetails {
  bio?: string;
  location?: string;
  favoriteGenre?: string;
  displayName?: string;
  photoURL?: string;
  bannerURL?: string;
}

const DEFAULT_BIO = "Passionate cinephile. Exploring the depths of indie films and classic sci-fi masterpieces. Always in search of the next hidden gem.";
const DEFAULT_LOCATION = "Los Angeles, CA";
const DEFAULT_GENRE = "Sci-Fi & Thriller";
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

export const profileService = {
  /**
   * Fetch the user's favorites from Firestore
   */
  getFavorites: async (uid: string): Promise<TmdbMedia[]> => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return (data.favorites as TmdbMedia[]) || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('Failed to fetch favorites');
    }
  },

  /**
   * Replace the user's favorites array in Firestore
   */
  updateFavorites: async (uid: string, favorites: TmdbMedia[]): Promise<void> => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      // Use merge: true so we don't overwrite other user profile data that might exist
      await setDoc(userDocRef, { favorites }, { merge: true });
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw new Error('Failed to update favorites');
    }
  },

  /**
   * Fetch the user's details from Firestore with dummy default fallbacks
   */
  getProfileDetails: async (uid: string): Promise<UserProfileDetails> => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          bio: data.bio !== undefined ? data.bio : DEFAULT_BIO,
          location: data.location !== undefined ? data.location : DEFAULT_LOCATION,
          favoriteGenre: data.favoriteGenre !== undefined ? data.favoriteGenre : DEFAULT_GENRE,
          photoURL: data.photoURL !== undefined ? data.photoURL : '',
          bannerURL: data.bannerURL !== undefined ? data.bannerURL : DEFAULT_BANNER,
        };
      }

      return {
        bio: DEFAULT_BIO,
        location: DEFAULT_LOCATION,
        favoriteGenre: DEFAULT_GENRE,
        photoURL: '',
        bannerURL: DEFAULT_BANNER,
      };
    } catch (error) {
      console.error('Error fetching profile details:', error);
      throw new Error('Failed to fetch profile details');
    }
  },

  /**
   * Update the user's details in Firestore and Firebase Authentication
   */
  updateProfileDetails: async (uid: string, details: UserProfileDetails): Promise<void> => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userDocRef, {
        bio: details.bio ?? '',
        location: details.location ?? '',
        favoriteGenre: details.favoriteGenre ?? '',
        photoURL: details.photoURL ?? '',
        bannerURL: details.bannerURL ?? DEFAULT_BANNER,
      }, { merge: true });

      // Synchronize with Firebase Auth properties if current auth user matches
      if (auth.currentUser) {
        const updateData: { displayName?: string; photoURL?: string } = {};
        if (details.displayName !== undefined) {
          updateData.displayName = details.displayName;
        }
        if (details.photoURL !== undefined) {
          updateData.photoURL = details.photoURL;
        }
        if (Object.keys(updateData).length > 0) {
          await updateProfile(auth.currentUser, updateData);
        }
      }
    } catch (error) {
      console.error('Error updating profile details:', error);
      throw new Error('Failed to update profile details');
    }
  },
};
