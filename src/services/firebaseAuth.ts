import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const firebaseAuth = {
  login: async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
  },

  register: async (email: string, pass: string) => {
    return await createUserWithEmailAndPassword(auth, email, pass);
  },

  logout: async () => {
    return await signOut(auth);
  },
};
