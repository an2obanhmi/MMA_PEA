import { Genre, MovieStatus } from '../types';

export const validateEmail = (email: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password: string, hasSubmitted: boolean, isRegister: boolean = false): string => {
  if (!hasSubmitted) return '';
  if (!password) return 'Password is required';
  if (isRegister && password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateConfirmPassword = (confirm: string, password: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!confirm) return 'Confirm password is required';
  if (confirm !== password) return 'Passwords do not match';
  return '';
};

export const validateTitle = (title: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!title.trim()) return 'Title is required';
  if (title.length > 100) return 'Title must be at most 100 characters';
  return '';
};

export const validateDirector = (director: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!director.trim()) return 'Director is required';
  if (director.length > 60) return 'Director must be at most 60 characters';
  return '';
};

export const validateGenre = (genre: Genre | '', hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!genre) return 'Please choose a genre';
  return '';
};

export const validateStatus = (status: MovieStatus | '', hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (!status) return 'Please choose a status';
  return '';
};

export const validateRating = (ratingStr: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (ratingStr.trim() === '') return '';
  const num = Number(ratingStr.trim());
  if (!Number.isInteger(num) || num < 0 || num > 5 || isNaN(num)) {
    return 'Rating must be a whole number from 0 to 5';
  }
  return '';
};

export const validateNotes = (notes: string, hasSubmitted: boolean): string => {
  if (!hasSubmitted) return '';
  if (notes.length > 300) return 'Notes must be at most 300 characters';
  return '';
};
