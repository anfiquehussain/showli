import { TMDB_IMAGE_BASE_URL } from '@/api/base';
import type { TmdbPosterSize, TmdbBackdropSize, TmdbProfileSize } from '@/types/tmdb.types';

/**
 * Constructs a full TMDb image URL.
 */
export const getTmdbImageUrl = (
  path: string | null | undefined,
  size: TmdbPosterSize | TmdbBackdropSize | TmdbProfileSize = 'original'
): string | undefined => {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Common backdrop sizes for the hero section
 */
export const HERO_BACKDROP_SIZE: TmdbBackdropSize = 'w1280';
export const DETAIL_POSTER_SIZE: TmdbPosterSize = 'w500';
export const THUMBNAIL_POSTER_SIZE: TmdbPosterSize = 'w185';
