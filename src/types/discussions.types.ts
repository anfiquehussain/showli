export interface Comment {
  id: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  rating: number | null; // 0-10, only for top-level reviews
  parentId: string | null; // For threading
  likes: string[]; // Array of user UIDs
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export interface AddCommentData {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  rating: number | null;
  parentId: string | null;
}
