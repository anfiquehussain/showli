import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Collection,
  CollectionMedia,
  UserMediaMetadata,
  MediaStatus,
} from '@/types/collections.types';

const USERS_COLLECTION = 'users';

export const collectionsService = {
  // =========================================================================
  // COLLECTIONS
  // =========================================================================

  /**
   * Get all collections for a user
   */
  getCollections: async (uid: string): Promise<Collection[]> => {
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const q = query(collectionsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Collection));
  },

  /**
   * Get a single collection by ID
   */
  getCollection: async (uid: string, collectionId: string): Promise<Collection | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Collection;
  },

  /**
   * Create a new collection
   */
  createCollection: async (
    uid: string, 
    data: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'media_count'>
  ): Promise<Collection> => {
    const newCollectionRef = doc(collection(db, USERS_COLLECTION, uid, 'collections'));
    
    const collectionData = {
      ...data,
      created_at: Date.now(),
      updated_at: Date.now(),
      media_count: 0,
    };

    await setDoc(newCollectionRef, collectionData);
    
    return {
      id: newCollectionRef.id,
      ...collectionData
    } as Collection;
  },

  /**
   * Update a collection
   */
  updateCollection: async (
    uid: string,
    collectionId: string,
    data: Partial<Omit<Collection, 'id' | 'created_at' | 'media_count'>>
  ): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    await updateDoc(docRef, {
      ...data,
      updated_at: Date.now()
    });
  },

  /**
   * Delete a collection (and theoretically its subcollection of media)
   */
  deleteCollection: async (uid: string, collectionId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    // Note: In Firestore, deleting a document does not automatically delete its subcollections.
    // For a robust app, we'd delete the 'movies' subcollection here using a batch or Cloud Function.
    // Given client constraints, we'll delete the main doc.
    await deleteDoc(docRef);
  },

  // =========================================================================
  // MEDIA IN COLLECTIONS
  // =========================================================================

  /**
   * Get all media in a specific collection
   */
  getCollectionMedia: async (uid: string, collectionId: string): Promise<CollectionMedia[]> => {
    const mediaRef = collection(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies');
    const q = query(mediaRef, orderBy('added_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data() as CollectionMedia);
  },

  /**
   * Get all unique media across all collections for a user
   */
  getAllUniqueMedia: async (uid: string): Promise<CollectionMedia[]> => {
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const collectionsSnapshot = await getDocs(collectionsRef);
    
    const allMedia: CollectionMedia[] = [];
    const mediaIds = new Set<number>();

    // Fetch media for each collection
    const mediaPromises = collectionsSnapshot.docs.map(async (colDoc) => {
      const mediaRef = collection(db, colDoc.ref.path, 'movies');
      const mediaSnapshot = await getDocs(mediaRef);
      return mediaSnapshot.docs.map(d => d.data() as CollectionMedia);
    });

    const mediaArrays = await Promise.all(mediaPromises);
    
    for (const items of mediaArrays) {
      for (const item of items) {
        if (!mediaIds.has(item.tmdb_id)) {
          mediaIds.add(item.tmdb_id);
          allMedia.push(item);
        }
      }
    }

    // Sort by added_at desc (most recent first)
    return allMedia.sort((a, b) => b.added_at - a.added_at);
  },

  /**
   * Add a media item to a collection
   */
  addMediaToCollection: async (
    uid: string,
    collectionId: string,
    media: Omit<CollectionMedia, 'added_at'>
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Add media to collection
    const mediaRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', media.tmdb_id.toString());
    batch.set(mediaRef, {
      ...media,
      status: 'planned', // Default status when adding to collection
      added_at: Date.now()
    });

    // 2. Increment media_count in the collection document
    const collectionRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    if (collectionSnap.exists()) {
      batch.update(collectionRef, {
        media_count: (collectionSnap.data().media_count || 0) + 1,
        updated_at: Date.now()
      });
    }

    await batch.commit();
  },

  /**
   * Remove a media item from a collection
   */
  removeMediaFromCollection: async (
    uid: string,
    collectionId: string,
    tmdbId: number
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Remove media item
    const mediaRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', tmdbId.toString());
    batch.delete(mediaRef);

    // 2. Decrement media_count
    const collectionRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    if (collectionSnap.exists()) {
      const currentCount = collectionSnap.data().media_count || 0;
      batch.update(collectionRef, {
        media_count: Math.max(0, currentCount - 1),
        updated_at: Date.now()
      });
    }

    await batch.commit();
  },

  /**
   * Remove a media item from all collections it belongs to
   */
  removeMediaFromAllCollections: async (uid: string, tmdbId: number): Promise<void> => {
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const collectionsSnap = await getDocs(collectionsRef);
    
    const batch = writeBatch(db);
    let removedCount = 0;

    for (const collectionDoc of collectionsSnap.docs) {
      const mediaRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionDoc.id, 'movies', tmdbId.toString());
      const mediaSnap = await getDoc(mediaRef);
      
      if (mediaSnap.exists()) {
        batch.delete(mediaRef);
        
        // Update count for this collection
        const currentCount = collectionDoc.data().media_count || 0;
        batch.update(collectionDoc.ref, {
          media_count: Math.max(0, currentCount - 1),
          updated_at: Date.now()
        });
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await batch.commit();
    }
  },

  /**
   * Update the status of a media item within a specific collection
   */
  updateCollectionMediaStatus: async (
    uid: string,
    collectionId: string,
    tmdbId: number,
    status: MediaStatus
  ): Promise<void> => {
    const mediaRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', tmdbId.toString());
    await updateDoc(mediaRef, {
      status,
      updated_at: Date.now()
    });
  },

  /**
   * Update a media item's status across all collections it belongs to
   */
  updateMediaStatusGlobally: async (
    uid: string,
    tmdbId: number,
    status: MediaStatus
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Update in metadata collection for persistence
    const metadataRef = doc(db, USERS_COLLECTION, uid, 'movies', tmdbId.toString());
    const metadataSnap = await getDoc(metadataRef);
    
    if (metadataSnap.exists()) {
      batch.update(metadataRef, { status, updated_at: Date.now() });
    } else {
      batch.set(metadataRef, { tmdb_id: tmdbId, status, updated_at: Date.now(), created_at: Date.now() });
    }

    // 2. Find and update in all collections
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const collectionsSnap = await getDocs(collectionsRef);
    
    for (const collectionDoc of collectionsSnap.docs) {
      const mediaRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionDoc.id, 'movies', tmdbId.toString());
      const mediaSnap = await getDoc(mediaRef);
      
      if (mediaSnap.exists()) {
        batch.update(mediaRef, { status, updated_at: Date.now() });
      }
    }

    await batch.commit();
  },

  // =========================================================================
  // GLOBAL MEDIA METADATA (STATUS, RATINGS, ETC)
  // =========================================================================

  /**
   * Get metadata for a specific media item
   */
  getUserMediaMetadata: async (uid: string, tmdbId: number): Promise<UserMediaMetadata | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'movies', tmdbId.toString());
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserMediaMetadata;
  },

  /**
   * Update or create metadata for a media item
   */
  updateUserMediaMetadata: async (
    uid: string,
    tmdbId: number,
    data: Partial<Omit<UserMediaMetadata, 'tmdb_id' | 'created_at'>>
  ): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'movies', tmdbId.toString());
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      await updateDoc(docRef, {
        ...data,
        updated_at: Date.now()
      });
    } else {
      // Create new
      if (!data.media_type) throw new Error('media_type is required when creating media metadata');
      
      const newMetadata: UserMediaMetadata = {
        tmdb_id: tmdbId,
        media_type: data.media_type,
        created_at: Date.now(),
        updated_at: Date.now(),
        ...data
      };
      await setDoc(docRef, newMetadata);
    }
  }
};
