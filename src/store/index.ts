import { configureStore } from '@reduxjs/toolkit';
import { mediaApi } from '@/api/media/mediaApi';
import { collectionsApi } from '@/api/collections/collectionsApi';

import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [collectionsApi.reducerPath]: collectionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(mediaApi.middleware, collectionsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
