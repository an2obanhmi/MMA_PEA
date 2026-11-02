import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyC1bQy_enjDYg4jDGRGsrYIPHwXKiqoFio",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mma-pea.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mma-pea",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mma-pea.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "642565269918",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:642565269918:web:bc9ba4052832c5b9ef0e8f",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K2HS9GZ6LQ",
};

// Khởi tạo Firebase App (tránh khởi tạo nhiều lần)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
