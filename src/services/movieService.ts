import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Movie } from '../types';

const COLLECTION_NAME = 'movies';

export const movieService = {
  // Đăng ký nhận dữ liệu thời gian thực của người dùng
  subscribeMovies: (
    userId: string,
    onSuccess: (movies: Movie[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe => {
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Movie[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            title: data.title || '',
            director: data.director || '',
            genre: data.genre,
            status: data.status,
            rating: data.rating !== undefined ? data.rating : null,
            favorite: !!data.favorite,
            notes: data.notes || '',
            createdAt: data.createdAt,
          } as Movie;
        });

        // Sắp xếp thứ tự chữ cái theo Title (case-insensitive), nếu bằng nhau thì theo Director
        list.sort((a, b) => {
          const titleComparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'accent' });
          if (titleComparison !== 0) return titleComparison;
          return a.director.localeCompare(b.director, undefined, { sensitivity: 'accent' });
        });

        onSuccess(list);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  },

  // Thêm phim mới (Kiểm tra trùng lặp Title + Director của cùng một User)
  addMovie: async (movieData: Omit<Movie, 'id'>): Promise<string> => {
    const { userId, title, director } = movieData;
    const cleanTitle = title.trim().toLowerCase();
    const cleanDirector = director.trim().toLowerCase();

    // Kiểm tra phim đã tồn tại với cùng user hay chưa
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const isDuplicate = snapshot.docs.some((d) => {
      const data = d.data();
      const existingTitle = (data.title || '').trim().toLowerCase();
      const existingDirector = (data.director || '').trim().toLowerCase();
      return existingTitle === cleanTitle && existingDirector === cleanDirector;
    });

    if (isDuplicate) {
      throw new Error('A movie with the same title and director already exists.');
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...movieData,
      title: movieData.title.trim(),
      director: movieData.director.trim(),
      notes: movieData.notes ? movieData.notes.trim() : '',
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // Cập nhật thông tin phim
  updateMovie: async (
    id: string,
    userId: string,
    updateData: Partial<Movie>
  ): Promise<void> => {
    // Nếu cập nhật title hoặc director, kiểm tra xem có bị trùng với phim khác của chính user này không
    if (updateData.title || updateData.director) {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const targetTitle = (updateData.title || '').trim().toLowerCase();
      const targetDirector = (updateData.director || '').trim().toLowerCase();

      const isDuplicate = snapshot.docs.some((d) => {
        if (d.id === id) return false; // Bỏ qua chính bản ghi đang sửa
        const data = d.data();
        const existingTitle = (data.title || '').trim().toLowerCase();
        const existingDirector = (data.director || '').trim().toLowerCase();
        return existingTitle === targetTitle && existingDirector === targetDirector;
      });

      if (isDuplicate) {
        throw new Error('A movie with the same title and director already exists.');
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updateData,
    });
  },

  // Bật/tắt trạng thái yêu thích
  toggleFavorite: async (id: string, currentFavorite: boolean): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      favorite: !currentFavorite,
    });
  },

  // Xóa phim
  deleteMovie: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
