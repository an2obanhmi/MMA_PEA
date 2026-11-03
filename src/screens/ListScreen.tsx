import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { firebaseAuth } from '../services/firebaseAuth';
import { movieService } from '../services/movieService';
import { Genre, Movie, MovieStatus } from '../types';
import { AppButton, AppInput, GenreStatusPicker, MovieItem } from '../components';
import { COLORS, GENRES, STATUSES } from '../constants/theme';
import {
  validateTitle,
  validateDirector,
  validateGenre,
  validateStatus,
  validateRating,
  validateNotes,
} from '../utils/validation';

type ListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'List'>;

interface Props {
  navigation: ListScreenNavigationProp;
}

export default function ListScreen({ navigation }: Props) {
  const { user } = useAuth();

  // State danh sách phim
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  // State Form thêm phim
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [status, setStatus] = useState<MovieStatus | ''>('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [movieSuccess, setMovieSuccess] = useState('');
  const [movieError, setMovieError] = useState('');

  // State bộ lọc (Filters & Search)
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<'All' | Genre>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | MovieStatus>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Đăng ký nhận dữ liệu thời gian thực
  useEffect(() => {
    if (!user) return;

    setLoadingMovies(true);
    const unsubscribe = movieService.subscribeMovies(
      user.uid,
      (data) => {
        setMovies(data);
        setLoadingMovies(false);
      },
      (error) => {
        setMovieError(error.message || 'Error fetching movies');
        setLoadingMovies(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await firebaseAuth.logout();
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Logout Error', err.message);
    }
  };

  // Validation messages
  const titleError = validateTitle(title, hasSubmittedForm);
  const directorError = validateDirector(director, hasSubmittedForm);
  const genreError = validateGenre(genre, hasSubmittedForm);
  const statusError = validateStatus(status, hasSubmittedForm);
  const ratingError = validateRating(rating, hasSubmittedForm);
  const notesError = validateNotes(notes, hasSubmittedForm);

  // Thêm phim mới
  const handleAddMovie = async () => {
    setHasSubmittedForm(true);
    setMovieSuccess('');
    setMovieError('');

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

    if (!user) return;

    setIsAdding(true);
    try {
      await movieService.addMovie({
        userId: user.uid,
        title: title.trim(),
        director: director.trim(),
        genre: genre as Genre,
        status: status as MovieStatus,
        rating: rating.trim() !== '' ? parseInt(rating.trim(), 10) : null,
        favorite: false,
        notes: notes.trim(),
      });

      setMovieSuccess('Movie added');
      setTitle('');
      setDirector('');
      setGenre('');
      setStatus('');
      setRating('');
      setNotes('');
      setHasSubmittedForm(false);
    } catch (err: any) {
      setMovieError(err.message || 'Error adding movie');
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (movie: Movie) => {
    try {
      await movieService.toggleFavorite(movie.id, movie.favorite);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Lọc và Tìm kiếm phim
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (selectedGenreFilter !== 'All' && m.genre !== selectedGenreFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'All' && m.status !== selectedStatusFilter) {
        return false;
      }
      if (favoritesOnly && !m.favorite) {
        return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (q !== '') {
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDirector = m.director.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDirector) {
          return false;
        }
      }
      return true;
    });
  }, [movies, selectedGenreFilter, selectedStatusFilter, favoritesOnly, searchQuery]);

  // Thống kê Breakdown theo Status
  const statusBreakdown = useMemo(() => {
    const counts: Record<MovieStatus, number> = {
      'Plan to Watch': 0,
      'Watching': 0,
      'Watched': 0,
    };

    filteredMovies.forEach((m) => {
      if (counts[m.status] !== undefined) {
        counts[m.status]++;
      }
    });

    const priority: Record<MovieStatus, number> = {
      'Plan to Watch': 1,
      'Watching': 2,
      'Watched': 3,
    };

    const result = (['Plan to Watch', 'Watching', 'Watched'] as MovieStatus[])
      .filter((st) => counts[st] > 0)
      .map((st) => ({
        status: st,
        count: counts[st],
      }));

    result.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return priority[a.status] - priority[b.status];
    });

    return result;
  }, [filteredMovies]);

  // Xóa bộ lọc
  const handleClearFilters = () => {
    setSelectedGenreFilter('All');
    setSelectedStatusFilter('All');
    setFavoritesOnly(false);
    setSearchQuery('');
  };

  const favoriteCount = useMemo(() => {
    return filteredMovies.filter((m) => m.favorite).length;
  }, [filteredMovies]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View testID="list-screen" style={styles.container}>
        {/* Header với email và Logout */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>CineList</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <AppButton
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutBtn}
            textStyle={styles.logoutBtnText}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* PHẦN A: FORM THÊM PHIM (testID="movie-form") */}
          <View testID="movie-form" style={styles.card}>
            <Text style={styles.sectionTitle}>Add a Movie</Text>

            {movieSuccess ? (
              <View style={styles.successBanner}>
                <Text testID="movie-success" style={styles.successBannerText}>
                  {movieSuccess}
                </Text>
              </View>
            ) : null}

            {movieError ? (
              <View style={styles.errorBanner}>
                <Text testID="error-movie" style={styles.errorBannerText}>
                  {movieError}
                </Text>
              </View>
            ) : null}

            <AppInput
              label="Title *"
              placeholder="e.g. Inception"
              value={title}
              error={titleError}
              onChangeText={(t) => {
                setTitle(t);
                setMovieSuccess('');
                setMovieError('');
              }}
            />

            <AppInput
              label="Director *"
              placeholder="e.g. Christopher Nolan"
              value={director}
              error={directorError}
              onChangeText={(t) => {
                setDirector(t);
                setMovieSuccess('');
                setMovieError('');
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
                setMovieSuccess('');
                setMovieError('');
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
                setMovieSuccess('');
                setMovieError('');
              }}
            />

            <AppInput
              label="Rating (0 - 5, optional)"
              placeholder="e.g. 5"
              keyboardType="numeric"
              value={rating}
              error={ratingError}
              onChangeText={(t) => {
                setRating(t);
                setMovieSuccess('');
                setMovieError('');
              }}
            />

            <View style={styles.notesGroup}>
              <Text style={styles.notesLabel}>Notes (optional, max 300 chars)</Text>
              <TextInput
                style={[styles.textArea, !!notesError && styles.inputInvalid]}
                placeholder="Personal thoughts or notes..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={(t) => {
                  setNotes(t);
                  setMovieSuccess('');
                  setMovieError('');
                }}
              />
              {notesError ? <Text style={styles.fieldErrorText}>{notesError}</Text> : null}
            </View>

            <AppButton
              title="Add Movie"
              variant="primary"
              loading={isAdding}
              onPress={handleAddMovie}
              style={styles.addBtn}
            />
          </View>

          {/* PHẦN C: FILTER, SEARCH VÀ SUMMARY */}
          <View style={styles.card}>
            <View style={styles.filterHeader}>
              <Text style={styles.sectionTitle}>Filters & Search</Text>
              <AppButton
                title="Clear"
                variant="secondary"
                onPress={handleClearFilters}
                style={styles.clearBtn}
                textStyle={styles.clearBtnText}
              />
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or director..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Text style={styles.filterLabel}>Genre Filter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {(['All', ...GENRES] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.filterChip, selectedGenreFilter === g && styles.filterChipActive]}
                  onPress={() => setSelectedGenreFilter(g)}
                >
                  <Text style={[styles.filterChipText, selectedGenreFilter === g && styles.filterChipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Status Filter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {(['All', ...STATUSES] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterChip, selectedStatusFilter === st && styles.filterChipActive]}
                  onPress={() => setSelectedStatusFilter(st)}
                >
                  <Text style={[styles.filterChipText, selectedStatusFilter === st && styles.filterChipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Favorites only</Text>
              <Switch
                value={favoritesOnly}
                onValueChange={setFavoritesOnly}
                trackColor={{ false: COLORS.cardBorder, true: COLORS.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryStatsRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Movies shown</Text>
                  <Text testID="movie-count" style={styles.summaryStatValue}>
                    {filteredMovies.length}
                  </Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Favorites</Text>
                  <Text testID="favorite-count" style={styles.summaryStatValue}>
                    {favoriteCount}
                  </Text>
                </View>
              </View>

              {statusBreakdown.length > 0 ? (
                <View style={styles.breakdownContainer}>
                  <Text style={styles.breakdownTitle}>Status Breakdown</Text>
                  {statusBreakdown.map((item) => (
                    <View key={item.status} style={styles.breakdownRow}>
                      <Text style={styles.breakdownStatusText}>{item.status}</Text>
                      <Text style={styles.breakdownCountText}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          {/* PHẦN B: DANH SÁCH PHIM */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Your Watchlist</Text>

            {loadingMovies ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : filteredMovies.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text testID="movies-empty" style={styles.emptyText}>
                  No movies found
                </Text>
              </View>
            ) : (
              <View style={styles.movieList}>
                {filteredMovies.map((movie) => (
                  <MovieItem
                    key={movie.id}
                    movie={movie}
                    onPress={() => navigation.navigate('Detail', { id: movie.id })}
                    onToggleFavorite={() => handleToggleFavorite(movie)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    height: 36,
    paddingHorizontal: 12,
  },
  logoutBtnText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  successBanner: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
  addBtn: {
    marginTop: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    height: 32,
    paddingHorizontal: 12,
  },
  clearBtnText: {
    fontSize: 12,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  filterChipRow: {
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    marginTop: 4,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
    paddingTop: 10,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  breakdownStatusText: {
    fontSize: 13,
    color: COLORS.textSub,
  },
  breakdownCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  listSection: {
    marginBottom: 30,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  movieList: {
    gap: 12,
  },
});
