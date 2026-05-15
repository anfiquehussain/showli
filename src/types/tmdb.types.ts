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

export interface TmdbCollectionBrief {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

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
  images?: TmdbImagesResponse;
  belongs_to_collection: TmdbCollectionBrief | null;
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
  production_countries: TmdbProductionCountryDetails[];
  spoken_languages: TmdbSpokenLanguage[];
  networks: TmdbNetwork[];
  created_by: TmdbCreator[];
  in_production: boolean;
  last_air_date: string;
  last_episode_to_air: TmdbEpisode | null;
  next_episode_to_air: TmdbEpisode | null;
  images?: TmdbImagesResponse;
  seasons: TmdbTVSeasonBrief[];
}

export interface TmdbTVSeasonBrief {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbTVSeason extends TmdbTVSeasonBrief {
  _id: string;
  episodes: TmdbEpisode[];
}

export interface TmdbCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  episode_type?: string;
  crew?: TmdbCrewMember[];
  guest_stars?: TmdbCastMember[];
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

export interface TmdbImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TmdbTaggedImage extends TmdbImage {
  image_type: string;
  media: TmdbMedia;
}

export interface TmdbImagesResponse {
  id: number;
  backdrops: TmdbImage[];
  logos: TmdbImage[];
  posters: TmdbImage[];
}

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
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

// --- Person Types ---

export interface TmdbPersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  known_for_department: string;
  place_of_birth: string | null;
  profile_path: string | null;
  adult: boolean;
  imdb_id: string | null;
  homepage: string | null;
  popularity: number;
  also_known_as: string[];
}

export type TmdbPersonCreditCast = TmdbMedia & {
  character: string;
  credit_id: string;
  order?: number;
  episode_count?: number; // for tv
  media_type: 'movie' | 'tv';
};

export type TmdbPersonCreditCrew = TmdbMedia & {
  credit_id: string;
  department: string;
  job: string;
  episode_count?: number; // for tv
  media_type: 'movie' | 'tv';
};

export interface TmdbPersonCombinedCredits {
  id: number;
  cast: TmdbPersonCreditCast[];
  crew: TmdbPersonCreditCrew[];
}

export interface TmdbPersonExternalIds {
  id: number;
  freebase_mid: string | null;
  freebase_id: string | null;
  imdb_id: string | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  twitter_id: string | null;
  youtube_id: string | null;
}
