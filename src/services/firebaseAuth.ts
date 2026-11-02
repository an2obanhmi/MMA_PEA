import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email không đúng định dạng.';
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác.';
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng, vui lòng kiểm tra đường truyền.';
    case 'auth/too-many-requests':
      return 'Thao tác quá nhiều lần. Vui lòng thử lại sau.';
    default:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
};

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
