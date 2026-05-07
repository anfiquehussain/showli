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
  CollectionMovie,
  UserMovieMetadata,
  MovieStatus,
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
    data: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'movie_count'>
  ): Promise<Collection> => {
    const newCollectionRef = doc(collection(db, USERS_COLLECTION, uid, 'collections'));
    
    const collectionData = {
      ...data,
      created_at: Date.now(),
      updated_at: Date.now(),
      movie_count: 0,
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
    data: Partial<Omit<Collection, 'id' | 'created_at' | 'movie_count'>>
  ): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    await updateDoc(docRef, {
      ...data,
      updated_at: Date.now()
    });
  },

  /**
   * Delete a collection (and theoretically its subcollection of movies)
   */
  deleteCollection: async (uid: string, collectionId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    // Note: In Firestore, deleting a document does not automatically delete its subcollections.
    // For a robust app, we'd delete the 'movies' subcollection here using a batch or Cloud Function.
    // Given client constraints, we'll delete the main doc.
    await deleteDoc(docRef);
  },

  // =========================================================================
  // MOVIES IN COLLECTIONS
  // =========================================================================

  /**
   * Get all movies in a specific collection
   */
  getCollectionMovies: async (uid: string, collectionId: string): Promise<CollectionMovie[]> => {
    const moviesRef = collection(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies');
    const q = query(moviesRef, orderBy('added_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data() as CollectionMovie);
  },

  /**
   * Get all unique movies across all collections for a user
   */
  getAllUniqueMovies: async (uid: string): Promise<CollectionMovie[]> => {
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const collectionsSnapshot = await getDocs(collectionsRef);
    
    const allMovies: CollectionMovie[] = [];
    const movieIds = new Set<number>();

    // Fetch movies for each collection
    // This is not the most efficient for many collections, but works for most users
    const moviePromises = collectionsSnapshot.docs.map(async (colDoc) => {
      const moviesRef = collection(db, colDoc.ref.path, 'movies');
      const moviesSnapshot = await getDocs(moviesRef);
      return moviesSnapshot.docs.map(d => d.data() as CollectionMovie);
    });

    const moviesArrays = await Promise.all(moviePromises);
    
    for (const movies of moviesArrays) {
      for (const movie of movies) {
        if (!movieIds.has(movie.tmdb_id)) {
          movieIds.add(movie.tmdb_id);
          allMovies.push(movie);
        }
      }
    }

    // Sort by added_at desc (most recent first)
    return allMovies.sort((a, b) => b.added_at - a.added_at);
  },

  /**
   * Add a movie to a collection
   */
  addMovieToCollection: async (
    uid: string,
    collectionId: string,
    movie: Omit<CollectionMovie, 'added_at'>
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Add movie to collection
    const movieRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', movie.tmdb_id.toString());
    batch.set(movieRef, {
      ...movie,
      status: 'planned', // Default status when adding to collection
      added_at: Date.now()
    });

    // 2. Increment movie_count in the collection document
    // Normally use FieldValue.increment(1) but RTK Query cache handles it manually for us too,
    // For safety, we'll get the current collection and increment. Or just leave it to RTK Query optimistic updates.
    // Better to use a Cloud Function for true counts, but let's read/update for now.
    const collectionRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    if (collectionSnap.exists()) {
      batch.update(collectionRef, {
        movie_count: (collectionSnap.data().movie_count || 0) + 1,
        updated_at: Date.now()
      });
    }

    await batch.commit();
  },

  /**
   * Remove a movie from a collection
   */
  removeMovieFromCollection: async (
    uid: string,
    collectionId: string,
    tmdbId: number
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Remove movie
    const movieRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', tmdbId.toString());
    batch.delete(movieRef);

    // 2. Decrement movie_count
    const collectionRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    if (collectionSnap.exists()) {
      const currentCount = collectionSnap.data().movie_count || 0;
      batch.update(collectionRef, {
        movie_count: Math.max(0, currentCount - 1),
        updated_at: Date.now()
      });
    }

    await batch.commit();
  },

  /**
   * Remove a movie from all collections it belongs to
   */
  removeMovieFromAllCollections: async (uid: string, tmdbId: number): Promise<void> => {
    const collectionsRef = collection(db, USERS_COLLECTION, uid, 'collections');
    const collectionsSnap = await getDocs(collectionsRef);
    
    const batch = writeBatch(db);
    let removedCount = 0;

    for (const collectionDoc of collectionsSnap.docs) {
      const movieRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionDoc.id, 'movies', tmdbId.toString());
      const movieSnap = await getDoc(movieRef);
      
      if (movieSnap.exists()) {
        batch.delete(movieRef);
        
        // Update count for this collection
        const currentCount = collectionDoc.data().movie_count || 0;
        batch.update(collectionDoc.ref, {
          movie_count: Math.max(0, currentCount - 1),
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
   * Update the status of a movie within a specific collection
   */
  updateCollectionMovieStatus: async (
    uid: string,
    collectionId: string,
    tmdbId: number,
    status: MovieStatus
  ): Promise<void> => {
    const movieRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionId, 'movies', tmdbId.toString());
    await updateDoc(movieRef, {
      status,
      updated_at: Date.now()
    });
  },

  /**
   * Update a movie's status across all collections it belongs to
   */
  updateMovieStatusGlobally: async (
    uid: string,
    tmdbId: number,
    status: MovieStatus
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
      const movieRef = doc(db, USERS_COLLECTION, uid, 'collections', collectionDoc.id, 'movies', tmdbId.toString());
      const movieSnap = await getDoc(movieRef);
      
      if (movieSnap.exists()) {
        batch.update(movieRef, { status, updated_at: Date.now() });
      }
    }

    await batch.commit();
  },

  // =========================================================================
  // GLOBAL MOVIE METADATA (STATUS, RATINGS, ETC)
  // =========================================================================

  /**
   * Get metadata for a specific movie
   */
  getUserMovieMetadata: async (uid: string, tmdbId: number): Promise<UserMovieMetadata | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid, 'movies', tmdbId.toString());
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserMovieMetadata;
  },

  /**
   * Update or create metadata for a movie
   */
  updateUserMovieMetadata: async (
    uid: string,
    tmdbId: number,
    data: Partial<Omit<UserMovieMetadata, 'tmdb_id' | 'created_at'>>
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
      if (!data.media_type) throw new Error('media_type is required when creating movie metadata');
      
      const newMetadata: UserMovieMetadata = {
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
