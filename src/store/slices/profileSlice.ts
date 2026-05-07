import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '@/api/profile/profileService';
import { logout } from '@/store/slices/authSlice';
import type { TmdbMedia } from '@/types/tmdb.types';

interface ProfileState {
  favorites: TmdbMedia[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  favorites: [],
  isLoading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  'profile/fetchFavorites',
  async (uid: string, { rejectWithValue }) => {
    try {
      const favorites = await profileService.getFavorites(uid);
      return favorites;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Failed to fetch favorites');
    }
  }
);

export const addUserFavorite = createAsyncThunk(
  'profile/addUserFavorite',
  async ({ uid, movie }: { uid: string; movie: TmdbMedia }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState };
      const currentFavorites = state.profile.favorites;

      if (currentFavorites.length >= 5) {
        return rejectWithValue('Maximum of 5 favorites allowed');
      }

      if (currentFavorites.some((m) => m.id === movie.id)) {
        return rejectWithValue('Movie already in favorites');
      }

      const newFavorites = [...currentFavorites, movie];
      await profileService.updateFavorites(uid, newFavorites);
      
      return movie;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Failed to add favorite');
    }
  }
);

export const removeUserFavorite = createAsyncThunk(
  'profile/removeUserFavorite',
  async ({ uid, movieId }: { uid: string; movieId: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState };
      const newFavorites = state.profile.favorites.filter((m) => m.id !== movieId);
      
      await profileService.updateFavorites(uid, newFavorites);
      
      return movieId;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Failed to remove favorite');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Keep this for clearing state on logout
    clearProfile: (state) => {
      state.favorites = [];
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Favorite
      .addCase(addUserFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addUserFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites.push(action.payload);
      })
      .addCase(addUserFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove Favorite
      .addCase(removeUserFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeUserFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = state.favorites.filter((m) => m.id !== action.payload);
      })
      .addCase(removeUserFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Clear profile on logout
      .addCase(logout, (state) => {
        state.favorites = [];
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
