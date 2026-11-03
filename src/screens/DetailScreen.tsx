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
import { AppButton, AppInput, GenreStatusPicker } from '../components';
import { COLORS, GENRES, STATUSES } from '../constants/theme';
import {
  validateTitle,
  validateDirector,
  validateGenre,
  validateStatus,
  validateRating,
  validateNotes,
} from '../utils/validation';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
}

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

  // Lắng nghe dữ liệu chi tiết của phim
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
  const titleError = validateTitle(title, hasSubmitted);
  const directorError = validateDirector(director, hasSubmitted);
  const genreError = validateGenre(genre, hasSubmitted);
  const statusError = validateStatus(status, hasSubmitted);
  const ratingError = validateRating(rating, hasSubmitted);
  const notesError = validateNotes(notes, hasSubmitted);

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

  const handleSaveEdit = async () => {
    setHasSubmitted(true);
    setEditError('');

    if (
      validateTitle(title, true) ||
      validateDirector(director, true) ||
      validateGenre(genre, true) ||
      validateStatus(status, true) ||
      validateRating(rating, true) ||
      validateNotes(notes, true)
    ) {
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

  const handleToggleFavorite = async () => {
    if (!movie) return;
    try {
      await movieService.toggleFavorite(movie.id, movie.favorite);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

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
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.notFoundText}>Movie not found.</Text>
          <AppButton
            title="Back to Watchlist"
            variant="secondary"
            onPress={() => navigation.navigate('List')}
          />
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
              <AppButton
                title="Edit"
                variant="primary"
                icon="✏️"
                onPress={handleStartEdit}
                style={styles.actionBtn}
              />
              <AppButton
                title="Delete"
                variant="danger"
                icon="🗑️"
                onPress={handleDelete}
                style={styles.actionBtn}
              />
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

            <AppInput
              label="Title *"
              value={title}
              error={titleError}
              onChangeText={(t) => {
                setTitle(t);
                setEditError('');
              }}
            />

            <AppInput
              label="Director *"
              value={director}
              error={directorError}
              onChangeText={(t) => {
                setDirector(t);
                setEditError('');
              }}
            />

            <GenreStatusPicker
              label="Genre *"
              options={GENRES}
              emptyLabel="Choose genre"
              selectedValue={genre}
              error={genreError}
              onSelect={(g) => {
                setGenre(g);
                setEditError('');
              }}
            />

            <GenreStatusPicker
              label="Status *"
              options={STATUSES}
              emptyLabel="Choose status"
              selectedValue={status}
              error={statusError}
              onSelect={(st) => {
                setStatus(st);
                setEditError('');
              }}
            />

            <AppInput
              label="Rating (0 - 5)"
              placeholder="Optional"
              keyboardType="numeric"
              value={rating}
              error={ratingError}
              onChangeText={(t) => {
                setRating(t);
                setEditError('');
              }}
            />

            <View style={styles.notesGroup}>
              <Text style={styles.notesLabel}>Notes (max 300 chars)</Text>
              <TextInput
                style={[styles.textArea, !!notesError && styles.inputInvalid]}
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

            <View style={styles.editActionRow}>
              <AppButton
                title="Save"
                variant="success"
                loading={saving}
                onPress={handleSaveEdit}
                style={styles.editActionBtn}
              />
              <AppButton
                title="Cancel"
                variant="secondary"
                disabled={saving}
                onPress={handleCancelEdit}
                style={styles.editActionBtn}
              />
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
    backgroundColor: COLORS.background,
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
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 30,
    color: COLORS.starInactive,
  },
  starIconActive: {
    color: COLORS.star,
  },
  directorText: {
    fontSize: 15,
    color: COLORS.textMuted,
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
    color: COLORS.badgeAction,
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
    color: COLORS.badgeWatched,
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
    color: COLORS.star,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
  },
  sectionBlock: {
    marginVertical: 4,
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  blockValue: {
    fontSize: 14,
    color: COLORS.textSub,
    lineHeight: 22,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
  editHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notesGroup: {
    marginBottom: 14,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 6,
  },
  textArea: {
    height: 70,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    textAlignVertical: 'top',
  },
  inputInvalid: {
    borderColor: COLORS.error,
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editActionBtn: {
    flex: 1,
  },
});
