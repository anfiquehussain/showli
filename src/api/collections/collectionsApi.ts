import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { collectionsService } from './collectionsService';
import type { 
  Collection, 
  CollectionMovie, 
  UserMovieMetadata,
  MovieStatus
} from '@/types/collections.types';

export const collectionsApi = createApi({
  reducerPath: 'collectionsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Collection', 'CollectionMovie', 'UserMovieMetadata'],
  endpoints: (builder) => ({
    getCollections: builder.query<Collection[], string>({
      queryFn: async (uid) => {
        try {
          const collections = await collectionsService.getCollections(uid);
          return { data: collections };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Collection' as const, id })),
              { type: 'Collection', id: 'LIST' },
            ]
          : [{ type: 'Collection', id: 'LIST' }],
    }),

    createCollection: builder.mutation<Collection, { uid: string; data: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'movie_count'> }>({
      queryFn: async ({ uid, data }) => {
        try {
          const newCollection = await collectionsService.createCollection(uid, data);
          return { data: newCollection };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: [{ type: 'Collection', id: 'LIST' }],
    }),

    updateCollection: builder.mutation<void, { uid: string; collectionId: string; data: Partial<Omit<Collection, 'id' | 'created_at' | 'movie_count'>> }>({
      queryFn: async ({ uid, collectionId, data }) => {
        try {
          await collectionsService.updateCollection(uid, collectionId, data);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'Collection', id: 'LIST' },
        { type: 'Collection', id: collectionId }
      ],
    }),

    deleteCollection: builder.mutation<void, { uid: string; collectionId: string }>({
      queryFn: async ({ uid, collectionId }) => {
        try {
          await collectionsService.deleteCollection(uid, collectionId);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    getCollectionMovies: builder.query<CollectionMovie[], { uid: string; collectionId: string }>({
      queryFn: async ({ uid, collectionId }) => {
        try {
          const movies = await collectionsService.getCollectionMovies(uid, collectionId);
          return { data: movies };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (_result, _error, { collectionId }) => [{ type: 'CollectionMovie', id: `LIST_${collectionId}` }],
    }),
    
    getAllCollectionMovies: builder.query<CollectionMovie[], string>({
      queryFn: async (uid) => {
        try {
          const movies = await collectionsService.getAllUniqueMovies(uid);
          return { data: movies };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ tmdb_id }) => ({ type: 'CollectionMovie' as const, id: tmdb_id })),
              { type: 'CollectionMovie', id: 'ALL' }
            ]
          : [{ type: 'CollectionMovie', id: 'ALL' }],
    }),

    addMovieToCollection: builder.mutation<void, { uid: string; collectionId: string; movie: Omit<CollectionMovie, 'added_at'> }>({
      queryFn: async ({ uid, collectionId, movie }) => {
        try {
          await collectionsService.addMovieToCollection(uid, collectionId, movie);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMovie', id: `LIST_${collectionId}` },
        { type: 'CollectionMovie', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    removeMovieFromCollection: builder.mutation<void, { uid: string; collectionId: string; tmdbId: number }>({
      queryFn: async ({ uid, collectionId, tmdbId }) => {
        try {
          await collectionsService.removeMovieFromCollection(uid, collectionId, tmdbId);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMovie', id: `LIST_${collectionId}` },
        { type: 'CollectionMovie', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    removeMovieFromLibrary: builder.mutation<void, { uid: string; tmdbId: number }>({
      queryFn: async ({ uid, tmdbId }) => {
        try {
          await collectionsService.removeMovieFromAllCollections(uid, tmdbId);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: () => [
        { type: 'CollectionMovie', id: 'ALL' },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    updateCollectionMovieStatus: builder.mutation<void, { uid: string; collectionId: string; tmdbId: number; status: MovieStatus }>({
      queryFn: async ({ uid, tmdbId, status }) => {
        try {
          await collectionsService.updateMovieStatusGlobally(uid, tmdbId, status);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMovie', id: `LIST_${collectionId}` },
        { type: 'CollectionMovie', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    getUserMovieMetadata: builder.query<UserMovieMetadata | null, { uid: string; tmdbId: number }>({
      queryFn: async ({ uid, tmdbId }) => {
        try {
          const metadata = await collectionsService.getUserMovieMetadata(uid, tmdbId);
          return { data: metadata };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (_result, _error, { tmdbId }) => [{ type: 'UserMovieMetadata', id: tmdbId }],
    }),

    updateUserMovieMetadata: builder.mutation<void, { uid: string; tmdbId: number; data: Partial<Omit<UserMovieMetadata, 'tmdb_id' | 'created_at'>> }>({
      queryFn: async ({ uid, tmdbId, data }) => {
        try {
          await collectionsService.updateUserMovieMetadata(uid, tmdbId, data);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { tmdbId }) => [{ type: 'UserMovieMetadata', id: tmdbId }],
    })
  }),
});

export const {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionMoviesQuery,
  useGetAllCollectionMoviesQuery,
  useAddMovieToCollectionMutation,
  useRemoveMovieFromCollectionMutation,
  useUpdateCollectionMovieStatusMutation,
  useRemoveMovieFromLibraryMutation,
  useGetUserMovieMetadataQuery,
  useUpdateUserMovieMetadataMutation,
} = collectionsApi;
