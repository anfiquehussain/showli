import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isModalOpen: false,
  modalMode: 'login',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    openModal: (state, action: PayloadAction<'login' | 'register' | undefined>) => {
      state.isModalOpen = true;
      if (action.payload) {
        state.modalMode = action.payload;
      }
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.error = null;
    },
    setModalMode: (state, action: PayloadAction<'login' | 'register'>) => {
      state.modalMode = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { 
  setUser, 
  setLoading, 
  setError, 
  openModal, 
  closeModal, 
  setModalMode,
  logout 
} = authSlice.actions;

export default authSlice.reducer;
