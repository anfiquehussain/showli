import { configureStore } from '@reduxjs/toolkit';
import { tmdbApi } from '@/api/tmdb/tmdbApi';
import { collectionsApi } from '@/api/collections/collectionsApi';

import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    [tmdbApi.reducerPath]: tmdbApi.reducer,
    [collectionsApi.reducerPath]: collectionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(tmdbApi.middleware, collectionsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
