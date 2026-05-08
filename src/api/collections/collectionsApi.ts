import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { collectionsService } from './collectionsService';
import type { 
  Collection, 
  CollectionMedia, 
  UserMediaMetadata,
  MediaStatus
} from '@/types/collections.types';

export const collectionsApi = createApi({
  reducerPath: 'collectionsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Collection', 'CollectionMedia', 'UserMediaMetadata'],
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

    createCollection: builder.mutation<Collection, { uid: string; data: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'media_count'> }>({
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

    updateCollection: builder.mutation<void, { uid: string; collectionId: string; data: Partial<Omit<Collection, 'id' | 'created_at' | 'media_count'>> }>({
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

    getCollectionMedia: builder.query<CollectionMedia[], { uid: string; collectionId: string }>({
      queryFn: async ({ uid, collectionId }) => {
        try {
          const items = await collectionsService.getCollectionMedia(uid, collectionId);
          return { data: items };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (_result, _error, { collectionId }) => [{ type: 'CollectionMedia', id: `LIST_${collectionId}` }],
    }),
    
    getAllCollectionMedia: builder.query<CollectionMedia[], string>({
      queryFn: async (uid) => {
        try {
          const items = await collectionsService.getAllUniqueMedia(uid);
          return { data: items };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ tmdb_id }) => ({ type: 'CollectionMedia' as const, id: tmdb_id })),
              { type: 'CollectionMedia', id: 'ALL' }
            ]
          : [{ type: 'CollectionMedia', id: 'ALL' }],
    }),

    addMediaToCollection: builder.mutation<void, { uid: string; collectionId: string; media: Omit<CollectionMedia, 'added_at'> }>({
      queryFn: async ({ uid, collectionId, media }) => {
        try {
          await collectionsService.addMediaToCollection(uid, collectionId, media);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMedia', id: `LIST_${collectionId}` },
        { type: 'CollectionMedia', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    removeMediaFromCollection: builder.mutation<void, { uid: string; collectionId: string; tmdbId: number }>({
      queryFn: async ({ uid, collectionId, tmdbId }) => {
        try {
          await collectionsService.removeMediaFromCollection(uid, collectionId, tmdbId);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMedia', id: `LIST_${collectionId}` },
        { type: 'CollectionMedia', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    removeMediaFromLibrary: builder.mutation<void, { uid: string; tmdbId: number }>({
      queryFn: async ({ uid, tmdbId }) => {
        try {
          await collectionsService.removeMediaFromAllCollections(uid, tmdbId);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: () => [
        { type: 'CollectionMedia', id: 'ALL' },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    updateCollectionMediaStatus: builder.mutation<void, { uid: string; collectionId: string; tmdbId: number; status: MediaStatus }>({
      queryFn: async ({ uid, tmdbId, status }) => {
        try {
          await collectionsService.updateMediaStatusGlobally(uid, tmdbId, status);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: 'CollectionMedia', id: `LIST_${collectionId}` },
        { type: 'CollectionMedia', id: 'ALL' },
        { type: 'Collection', id: collectionId },
        { type: 'Collection', id: 'LIST' }
      ],
    }),

    getUserMediaMetadata: builder.query<UserMediaMetadata | null, { uid: string; tmdbId: number }>({
      queryFn: async ({ uid, tmdbId }) => {
        try {
          const metadata = await collectionsService.getUserMediaMetadata(uid, tmdbId);
          return { data: metadata };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      providesTags: (_result, _error, { tmdbId }) => [{ type: 'UserMediaMetadata', id: tmdbId }],
    }),

    updateUserMediaMetadata: builder.mutation<void, { uid: string; tmdbId: number; data: Partial<Omit<UserMediaMetadata, 'tmdb_id' | 'created_at'>> }>({
      queryFn: async ({ uid, tmdbId, data }) => {
        try {
          await collectionsService.updateUserMediaMetadata(uid, tmdbId, data);
          return { data: undefined };
        } catch (error: unknown) {
          return { error: { status: 500, data: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
      invalidatesTags: (_result, _error, { tmdbId }) => [{ type: 'UserMediaMetadata', id: tmdbId }],
    })
  }),
});

export const {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionMediaQuery,
  useGetAllCollectionMediaQuery,
  useAddMediaToCollectionMutation,
  useRemoveMediaFromCollectionMutation,
  useUpdateCollectionMediaStatusMutation,
  useRemoveMediaFromLibraryMutation,
  useGetUserMediaMetadataQuery,
  useUpdateUserMediaMetadataMutation,
} = collectionsApi;
