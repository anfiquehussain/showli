import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove,

} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Comment, AddCommentData } from '@/types/discussions.types';

const COMMENTS_COLLECTION = 'comments';

export const discussionsService = {
  /**
   * Subscribe to real-time updates for comments on a specific media item
   */
  subscribeToComments: (
    mediaId: number,
    mediaType: 'movie' | 'tv',
    callback: (comments: Comment[]) => void
  ) => {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('mediaId', '==', mediaId),
      where('mediaType', '==', mediaType),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q, 
      (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        callback(comments);
      },
      (error) => {
        // Handle index building error gracefully
        if (error.code === 'failed-precondition') {
          console.warn('Firestore index is still building. Discussions will appear shortly...');
        } else {
          console.error('Firestore snapshot error:', error);
        }
      }
    );
  },

  /**
   * Add a new comment or review
   */
  addComment: async (data: AddCommentData): Promise<string> => {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const now = Date.now();
    
    const docRef = await addDoc(commentsRef, {
      ...data,
      likes: [],
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  },

  /**
   * Update an existing comment
   */
  updateComment: async (commentId: string, content: string): Promise<void> => {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      content,
      updatedAt: Date.now(),
    });
  },

  deleteComment: async (commentId: string): Promise<void> => {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      isDeleted: true,
      content: '[deleted]',
      userName: '[deleted]',
      userAvatar: null,
      rating: null,
      updatedAt: Date.now(),
    });
  },

  /**
   * Toggle like on a comment
   */
  toggleLike: async (commentId: string, userId: string, isLiked: boolean): Promise<void> => {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
  },
};
