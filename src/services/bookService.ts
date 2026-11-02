import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'books';

export interface Book {
  id?: string;
  title: string;
  author: string;
  price?: number;
  description?: string;
  createdAt?: any;
}

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
  },

  getById: async (id: string): Promise<Book | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Book;
    }
    return null;
  },

  create: async (data: Omit<Book, 'id'>) => {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date(),
    });
  },

  update: async (id: string, data: Partial<Book>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, data);
  },

  delete: async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(docRef);
  },
};
