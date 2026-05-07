/**
 * Global Type Barrel Export
 *
 * Re-exports all shared types from a single entry point.
 * Usage: import type { TmdbMovie, TmdbGenre } from '@/types';
 */

export type {
  TmdbMovie,
  TmdbTV,
  TmdbMedia,
  TmdbMovieDetails,
  TmdbGenre,
  TmdbProductionCompany,
  TmdbSpokenLanguage,
  TmdbCastMember,
  TmdbCrewMember,
  TmdbPaginatedResponse,
  TmdbCreditsResponse,
  TmdbPosterSize,
  TmdbBackdropSize,
  TmdbProfileSize,
} from './tmdb.types';

export type {
  User,
  AuthState,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';

export * from './collections.types';
