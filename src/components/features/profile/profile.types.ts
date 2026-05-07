import type { TmdbMedia } from '@/types/tmdb.types';

export interface ProfileStats {
  moviesWatched: number;
  listsCreated: number;
  reviewsWritten: number;
  followers: number;
}

export interface UserReview {
  id: string;
  mediaId: number;
  mediaTitle: string;
  mediaType: 'movie' | 'tv';
  rating: number;
  comment: string;
  date: string;
  posterPath: string | null;
}

export interface ProfileData {
  stats: ProfileStats;
  favorites: TmdbMedia[];
  wishlist: TmdbMedia[];
  collections: {
    id: string;
    name: string;
    itemCount: number;
    backdropPath: string | null;
  }[];
  reviews: UserReview[];
}
