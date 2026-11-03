export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Horror';
export type MovieStatus = 'Plan to Watch' | 'Watching' | 'Watched';

export interface Movie {
  id: string;
  userId: string;
  title: string;
  director: string;
  genre: Genre;
  status: MovieStatus;
  rating?: number | null;
  favorite: boolean;
  notes?: string;
  createdAt?: any;
}

export interface MovieFormData {
  title: string;
  director: string;
  genre: Genre | '';
  status: MovieStatus | '';
  rating: string;
  notes: string;
}
