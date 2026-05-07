import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService } from '@/api/auth/authService';
import { useAppDispatch, useAppSelector } from './useRedux';
import { 
  setUser, 
  setLoading, 
  setError, 
  closeModal 
} from '@/store/slices/authSlice';
import { useToast } from './useToast';
import type { LoginFormValues, RegisterFormValues, User } from '@/types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, isModalOpen, modalMode } = useAppSelector((state) => state.auth);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          createdAt: firebaseUser.metadata.creationTime,
          lastLoginAt: firebaseUser.metadata.lastSignInTime,
        };
        dispatch(setUser(userData));
      } else {
        dispatch(setUser(null));
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const login = async (data: LoginFormValues) => {
    dispatch(setLoading(true));
    try {
      await authService.login(data);
      toast.success('Welcome back!');
      dispatch(closeModal());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const message = firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : 'An error occurred during login';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (data: RegisterFormValues) => {
    dispatch(setLoading(true));
    try {
      await authService.register(data);
      toast.success('Account created successfully!');
      dispatch(closeModal());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      let message = 'An error occurred during registration';
      if (firebaseError.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        message = 'Email/Password auth is not enabled in Firebase Console';
      }
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signInWithGoogle = async () => {
    dispatch(setLoading(true));
    try {
      await authService.signInWithGoogle();
      toast.success('Signed in with Google!');
      dispatch(closeModal());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        const message = firebaseError.code === 'auth/operation-not-allowed'
          ? 'Google auth is not enabled in Firebase Console'
          : 'Failed to sign in with Google';
        dispatch(setError(message));
        toast.error(message);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isModalOpen,
    modalMode,
    login,
    register,
    signInWithGoogle,
    logout,
  };
};
