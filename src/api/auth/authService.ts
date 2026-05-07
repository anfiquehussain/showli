import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { LoginFormValues, RegisterFormValues } from '@/types/auth.types';

export const authService = {
  async login({ email, password }: LoginFormValues) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async register({ email, password, name }: RegisterFormValues) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: name,
    });
    return userCredential;
  },

  async logout() {
    return signOut(auth);
  },

  async signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  },
};
