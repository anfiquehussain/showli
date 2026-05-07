export type MovieStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped' | 'rewatching';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public';
  color?: string;
  icon?: string;
  created_at: number;
  updated_at: number;
  movie_count: number;
  is_default: boolean;
  is_all_media?: boolean;
  is_pinned?: boolean;
}

// Global user-movie metadata stored in users/{uid}/movies/{movieId}
export interface UserMovieMetadata {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  status?: MovieStatus;
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

// Pointer to a movie stored in users/{uid}/collections/{collectionId}/movies/{movieId}
export interface CollectionMovie {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  added_at: number;
  status?: MovieStatus;
}

// When returning a movie with its metadata joined
export interface CollectionMovieWithMetadata extends CollectionMovie {
  metadata?: UserMovieMetadata;
}
