import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const firebaseAuth = {
  login: async (email: string, pass: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email.trim(), pass);
  },

  register: async (email: string, pass: string): Promise<UserCredential> => {
    return await createUserWithEmailAndPassword(auth, email.trim(), pass);
  },

  logout: async (): Promise<void> => {
    return await signOut(auth);
  },
};
