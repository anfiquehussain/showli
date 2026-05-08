/**
 * TMDb API Type Definitions
 *
 * Types for The Movie Database (TMDb) API responses.
 * @see https://developer.themoviedb.org/reference
 */

// --- Core Entity Types ---

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
  media_type?: 'movie';
}

export interface TmdbTV {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  original_name: string;
  origin_country: string[];
  media_type?: 'tv';
}

export type TmdbMedia = TmdbMovie | TmdbTV;

export interface TmdbMovieDetails extends TmdbMovie {
  budget: number;
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string | null;
  homepage: string | null;
  imdb_id: string | null;
  genres: TmdbGenre[];
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountryDetails[];
  spoken_languages: TmdbSpokenLanguage[];
}

export interface TmdbProductionCountryDetails {
  iso_3166_1: string;
  name: string;
}

export interface TmdbTVDetails extends TmdbTV {
  episode_run_time: number[];
  number_of_episodes: number;
  number_of_seasons: number;
  type: string;
  status: string;
  tagline: string | null;
  homepage: string | null;
  genres: TmdbGenre[];
  production_companies: TmdbProductionCompany[];
  spoken_languages: TmdbSpokenLanguage[];
  networks: TmdbNetwork[];
  in_production: boolean;
  last_air_date: string;
}

export interface TmdbNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TmdbCountry {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  roles?: { character: string; episode_count: number }[];
  profile_path: string | null;
  order: number;
  total_episode_count?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
  jobs?: { job: string; episode_count: number }[];
  department: string;
  profile_path: string | null;
  total_episode_count?: number;
}

export interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
}

// --- Response Wrappers ---

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbAggregateCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TmdbWatchProvidersResponse {
  id: number;
  results: Record<string, {
    link: string;
    flatrate?: TmdbWatchProvider[];
    rent?: TmdbWatchProvider[];
    buy?: TmdbWatchProvider[];
    ads?: TmdbWatchProvider[];
  }>;
}

export interface TmdbReview {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

// --- Image Sizes ---

export type TmdbPosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type TmdbBackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type TmdbProfileSize = 'w45' | 'w185' | 'h632' | 'original';
export type TmdbStillSize = 'w92' | 'w185' | 'w300' | 'original';
export type TmdbLogoSize = 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original';
