import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TmdbMedia } from '@/types/tmdb.types';

const USERS_COLLECTION = 'users';

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
};
