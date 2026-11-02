export interface Book {
  id?: string;
  title: string;
  author: string;
  price?: number;
  description?: string;
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
