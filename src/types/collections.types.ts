export type MediaStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped' | 'rewatching';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public';
  color?: string;
  icon?: string;
  created_at: number;
  updated_at: number;
  media_count: number;
  is_default: boolean;
  is_all_media?: boolean;
  is_pinned?: boolean;
}

// Global user-media metadata stored in users/{uid}/movies/{movieId}
export interface UserMediaMetadata {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  status?: MediaStatus;
  rating?: number; // 1-10
  notes?: string;
  watched_date?: number;
  rewatch_count?: number;
  
  // TV Series specific
  watched_episodes?: number;
  watched_seasons?: number;
  
  created_at: number;
  updated_at: number;
}

// Pointer to a media item stored in users/{uid}/collections/{collectionId}/movies/{movieId}
export interface CollectionMedia {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  added_at: number;
  status?: MediaStatus;
}

// When returning a media item with its metadata joined
export interface CollectionMediaWithMetadata extends CollectionMedia {
  metadata?: UserMediaMetadata;
}
