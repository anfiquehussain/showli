import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../base';
import type { 
  TmdbMedia, 
  TmdbPaginatedResponse, 
  TmdbMovieDetails, 
  TmdbTVDetails,
  TmdbCountry,
  TmdbLanguage,
  TmdbGenre
} from '@/types/tmdb.types';

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
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
  useGetTVGenresQuery
} = tmdbApi;
