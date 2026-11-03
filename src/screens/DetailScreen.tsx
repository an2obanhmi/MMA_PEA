import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';
import { Genre, Movie, MovieStatus } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
}

const GENRES: Genre[] = ['Action', 'Comedy', 'Drama', 'Horror'];
const STATUSES: MovieStatus[] = ['Plan to Watch', 'Watching', 'Watched'];

export default function DetailScreen({ route, navigation }: Props) {
  const movieId = route.params?.id;
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [status, setStatus] = useState<MovieStatus | ''>('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Lắng nghe dữ liệu chi tiết của phim theo thời gian thực
  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'movies', movieId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentMovie: Movie = {
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
          };
          setMovie(currentMovie);

          // Cập nhật giá trị vào form edit
          setTitle(currentMovie.title);
          setDirector(currentMovie.director);
          setGenre(currentMovie.genre);
          setStatus(currentMovie.status);
          setRating(currentMovie.rating !== null ? String(currentMovie.rating) : '');
          setNotes(currentMovie.notes || '');
        } else {
          setMovie(null);
        }
        setLoading(false);
      },
      (error) => {
        Alert.alert('Error', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [movieId]);

  // Validation rules
  const getTitleError = () => {
    if (!hasSubmitted) return '';
    if (!title.trim()) return 'Title is required';
    if (title.length > 100) return 'Title must be at most 100 characters';
    return '';
  };

  const getDirectorError = () => {
    if (!hasSubmitted) return '';
    if (!director.trim()) return 'Director is required';
    if (director.length > 60) return 'Director must be at most 60 characters';
    return '';
  };

  const getGenreError = () => {
    if (!hasSubmitted) return '';
    if (!genre) return 'Please choose a genre';
    return '';
  };

  const getStatusError = () => {
    if (!hasSubmitted) return '';
    if (!status) return 'Please choose a status';
    return '';
  };

  const getRatingError = () => {
    if (!hasSubmitted) return '';
    if (rating.trim() === '') return '';
    const num = Number(rating.trim());
    if (!Number.isInteger(num) || num < 0 || num > 5 || isNaN(num)) {
      return 'Rating must be a whole number from 0 to 5';
    }
    return '';
  };

  const getNotesError = () => {
    if (!hasSubmitted) return '';
    if (notes.length > 300) return 'Notes must be at most 300 characters';
    return '';
  };

  const titleError = getTitleError();
  const directorError = getDirectorError();
  const genreError = getGenreError();
  const statusError = getStatusError();
  const ratingError = getRatingError();
  const notesError = getNotesError();

  // Bật chế độ sửa
  const handleStartEdit = () => {
    if (!movie) return;
    setTitle(movie.title);
    setDirector(movie.director);
    setGenre(movie.genre);
    setStatus(movie.status);
    setRating(movie.rating !== null && movie.rating !== undefined ? String(movie.rating) : '');
    setNotes(movie.notes || '');
    setHasSubmitted(false);
    setEditError('');
    setIsEditing(true);
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    if (!movie) return;
    setTitle(movie.title);
    setDirector(movie.director);
    setGenre(movie.genre);
    setStatus(movie.status);
    setRating(movie.rating !== null && movie.rating !== undefined ? String(movie.rating) : '');
    setNotes(movie.notes || '');
    setHasSubmitted(false);
    setEditError('');
    setIsEditing(false);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    setHasSubmitted(true);
    setEditError('');

    const isTitleValid = title.trim() !== '' && title.length <= 100;
    const isDirectorValid = director.trim() !== '' && director.length <= 60;
    const isGenreValid = genre !== '';
    const isStatusValid = status !== '';

    let isRatingValid = true;
    if (rating.trim() !== '') {
      const num = Number(rating.trim());
      isRatingValid = Number.isInteger(num) && num >= 0 && num <= 5;
    }

    const isNotesValid = notes.length <= 300;

    if (!isTitleValid || !isDirectorValid || !isGenreValid || !isStatusValid || !isRatingValid || !isNotesValid) {
      return;
    }

    if (!movie || !user) return;

    setSaving(true);
    try {
      await movieService.updateMovie(movie.id, user.uid, {
        title: title.trim(),
        director: director.trim(),
        genre: genre as Genre,
        status: status as MovieStatus,
        rating: rating.trim() !== '' ? parseInt(rating.trim(), 10) : null,
        notes: notes.trim(),
      });

      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message || 'Error updating movie');
    } finally {
      setSaving(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!movie) return;
    try {
      await movieService.toggleFavorite(movie.id, movie.favorite);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Xóa phim với Confirmation Dialog
  const handleDelete = () => {
    if (!movie) return;

    Alert.alert(
      'Delete Movie',
      `Are you sure you want to delete "${movie.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await movieService.deleteMovie(movie.id);
              navigation.navigate('List');
            } catch (err: any) {
              Alert.alert('Delete Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.notFoundText}>Movie not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('List')}>
            <Text style={styles.backBtnText}>Back to Watchlist</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* VIEW MODE */}
        {!isEditing ? (
          <View style={styles.detailCard}>
            <View style={styles.headerRow}>
              <Text style={styles.titleText}>{movie.title}</Text>
              <TouchableOpacity
                style={styles.starBtn}
                onPress={handleToggleFavorite}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.starIcon, movie.favorite && styles.starIconActive]}>
                  {movie.favorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.directorText}>Directed by {movie.director}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.genreBadge}>
                <Text style={styles.genreBadgeText}>{movie.genre}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{movie.status}</Text>
              </View>
              {movie.rating !== null && movie.rating !== undefined ? (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>⭐ {movie.rating} / 5</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionBlock}>
              <Text style={styles.blockLabel}>Notes</Text>
              <Text style={styles.blockValue}>
                {movie.notes ? movie.notes : 'No personal notes provided.'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.editBtn} onPress={handleStartEdit}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* EDIT MODE */
          <View style={styles.detailCard}>
            <Text style={styles.editHeaderTitle}>Edit Movie Details</Text>

            {editError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{editError}</Text>
              </View>
            ) : null}

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, titleError ? styles.inputInvalid : null]}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  setEditError('');
                }}
              />
              {titleError ? <Text style={styles.fieldErrorText}>{titleError}</Text> : null}
            </View>

            {/* Director */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Director *</Text>
              <TextInput
                style={[styles.input, directorError ? styles.inputInvalid : null]}
                value={director}
                onChangeText={(t) => {
                  setDirector(t);
                  setEditError('');
                }}
              />
              {directorError ? <Text style={styles.fieldErrorText}>{directorError}</Text> : null}
            </View>

            {/* Genre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genre *</Text>
              <View style={styles.pickerRow}>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pickerChip, genre === g && styles.pickerChipActive]}
                    onPress={() => {
                      setGenre(g);
                      setEditError('');
                    }}
                  >
                    <Text style={[styles.pickerChipText, genre === g && styles.pickerChipTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {genreError ? <Text style={styles.fieldErrorText}>{genreError}</Text> : null}
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.pickerRow}>
                {STATUSES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.pickerChip, status === st && styles.pickerChipActive]}
                    onPress={() => {
                      setStatus(st);
                      setEditError('');
                    }}
                  >
                    <Text style={[styles.pickerChipText, status === st && styles.pickerChipTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {statusError ? <Text style={styles.fieldErrorText}>{statusError}</Text> : null}
            </View>

            {/* Rating */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rating (0 - 5)</Text>
              <TextInput
                style={[styles.input, ratingError ? styles.inputInvalid : null]}
                keyboardType="numeric"
                value={rating}
                placeholder="Optional"
                placeholderTextColor="#64748b"
                onChangeText={(t) => {
                  setRating(t);
                  setEditError('');
                }}
              />
              {ratingError ? <Text style={styles.fieldErrorText}>{ratingError}</Text> : null}
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (max 300 chars)</Text>
              <TextInput
                style={[styles.textArea, notesError ? styles.inputInvalid : null]}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={(t) => {
                  setNotes(t);
                  setEditError('');
                }}
              />
              {notesError ? <Text style={styles.fieldErrorText}>{notesError}</Text> : null}
            </View>

            {/* Save & Cancel Buttons */}
            <View style={styles.editActionRow}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.buttonDisabled]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    flex: 1,
    marginRight: 10,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 30,
    color: '#64748b',
  },
  starIconActive: {
    color: '#facc15',
  },
  directorText: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  genreBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  genreBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60a5fa',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
  ratingBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fde047',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  sectionBlock: {
    marginVertical: 4,
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  blockValue: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  editHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#f8fafc',
    backgroundColor: '#0f172a',
  },
  textArea: {
    height: 70,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#f8fafc',
    backgroundColor: '#0f172a',
    textAlignVertical: 'top',
  },
  inputInvalid: {
    borderColor: '#ef4444',
  },
  fieldErrorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
  },
  pickerChipActive: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  pickerChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  pickerChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
