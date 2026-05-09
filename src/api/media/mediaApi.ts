import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../base';
import type { 
  TmdbMedia, 
  TmdbPaginatedResponse, 
  TmdbMovieDetails, 
  TmdbTVDetails,
  TmdbCountry,
  TmdbLanguage,
  TmdbGenre,
  TmdbConfiguration,
  TmdbReview,
  TmdbCreditsResponse,
  TmdbAggregateCreditsResponse,
  TmdbWatchProvidersResponse,
  TmdbImagesResponse,
  TmdbVideosResponse,
  TmdbTVSeason
} from '@/types/tmdb.types';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: TMDB_BASE_URL,
  }),
  endpoints: (builder) => ({
    getTrending: builder.query<TmdbPaginatedResponse<TmdbMedia>, { type: string; timeWindow?: string }>({
      query: ({ type = 'all', timeWindow = 'day' }) => 
        `/trending/${type}/${timeWindow}?api_key=${TMDB_API_KEY}`,
    }),
    getAiringToday: builder.query<TmdbPaginatedResponse<TmdbMedia>, void>({
      query: () => `/tv/airing_today?api_key=${TMDB_API_KEY}`,
    }),
    getPopularMovies: builder.query<TmdbPaginatedResponse<TmdbMedia>, void>({
      query: () => `/movie/popular?api_key=${TMDB_API_KEY}`,
    }),
    getTopRatedTV: builder.query<TmdbPaginatedResponse<TmdbMedia>, void>({
      query: () => `/tv/top_rated?api_key=${TMDB_API_KEY}`,
    }),
    discover: builder.query<TmdbPaginatedResponse<TmdbMedia>, { type: 'movie' | 'tv'; params?: Record<string, string | number> }>({
      query: ({ type, params = {} }) => {
        const searchParams = new URLSearchParams({
          api_key: TMDB_API_KEY,
          ...Object.entries(params).reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
        });
        return `/discover/${type}?${searchParams.toString()}`;
      },
    }),
    getDiscoveryContent: builder.query<TmdbPaginatedResponse<TmdbMedia>, { path: string; params?: Record<string, string | number | boolean> }>({
      query: ({ path, params = {} }) => {
        const searchParams = new URLSearchParams({
          api_key: TMDB_API_KEY,
          ...Object.entries(params).reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
        });
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}${searchParams.toString()}`;
      },
    }),
    getMovieDetails: builder.query<TmdbMovieDetails, number>({
      query: (id) => `/movie/${id}?api_key=${TMDB_API_KEY}`,
    }),
    getTVDetails: builder.query<TmdbTVDetails, number>({
      query: (id) => `/tv/${id}?api_key=${TMDB_API_KEY}`,
    }),
    searchMedia: builder.query<TmdbPaginatedResponse<TmdbMedia>, string>({
      query: (query) => `/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    }),
    getCountries: builder.query<TmdbCountry[], void>({
      query: () => `/configuration/countries?api_key=${TMDB_API_KEY}`,
    }),
    getLanguages: builder.query<TmdbLanguage[], void>({
      query: () => `/configuration/languages?api_key=${TMDB_API_KEY}`,
    }),
    getMovieGenres: builder.query<{ genres: TmdbGenre[] }, void>({
      query: () => `/genre/movie/list?api_key=${TMDB_API_KEY}`,
    }),
    getTVGenres: builder.query<{ genres: TmdbGenre[] }, void>({
      query: () => `/genre/tv/list?api_key=${TMDB_API_KEY}`,
    }),
    getConfiguration: builder.query<TmdbConfiguration, void>({
      query: () => `/configuration?api_key=${TMDB_API_KEY}`,
    }),
    getReviews: builder.query<TmdbPaginatedResponse<TmdbReview>, { type: 'movie' | 'tv'; id: number; page?: number }>({
      query: ({ type, id, page = 1 }) => `/${type}/${id}/reviews?api_key=${TMDB_API_KEY}&page=${page}`,
    }),
    getCredits: builder.query<TmdbCreditsResponse, number>({
      query: (id) => `/movie/${id}/credits?api_key=${TMDB_API_KEY}`,
    }),
    getTVCredits: builder.query<TmdbAggregateCreditsResponse, number>({
      query: (id) => `/tv/${id}/aggregate_credits?api_key=${TMDB_API_KEY}`,
    }),
    getWatchProviders: builder.query<TmdbWatchProvidersResponse, { type: 'movie' | 'tv'; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`,
    }),
    getSimilar: builder.query<TmdbPaginatedResponse<TmdbMedia>, { type: 'movie' | 'tv'; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/similar?api_key=${TMDB_API_KEY}`,
    }),
    getRecommendations: builder.query<TmdbPaginatedResponse<TmdbMedia>, { type: 'movie' | 'tv'; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`,
    }),
    getMediaImages: builder.query<TmdbImagesResponse, { type: 'movie' | 'tv'; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/images?api_key=${TMDB_API_KEY}`,
    }),
    getMediaVideos: builder.query<TmdbVideosResponse, { type: 'movie' | 'tv'; id: number }>({
      query: ({ type, id }) => `/${type}/${id}/videos?api_key=${TMDB_API_KEY}`,
    }),
    getTVSeasonDetails: builder.query<TmdbTVSeason, { tvId: number; seasonNumber: number }>({
      query: ({ tvId, seasonNumber }) => `/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`,
    }),
  }),
});

export const { 
  useGetTrendingQuery, 
  useGetAiringTodayQuery,
  useGetPopularMoviesQuery,
  useGetTopRatedTVQuery,
  useDiscoverQuery,
  useGetDiscoveryContentQuery,
  useGetMovieDetailsQuery,
  useGetTVDetailsQuery,
  useSearchMediaQuery,
  useGetCountriesQuery,
  useGetLanguagesQuery,
  useGetMovieGenresQuery,
  useGetTVGenresQuery,
  useGetConfigurationQuery,
  useGetReviewsQuery,
  useGetCreditsQuery,
  useGetTVCreditsQuery,
  useGetWatchProvidersQuery,
  useGetSimilarQuery,
  useGetRecommendationsQuery,
  useGetMediaImagesQuery,
  useGetMediaVideosQuery,
  useGetTVSeasonDetailsQuery
} = mediaApi;
