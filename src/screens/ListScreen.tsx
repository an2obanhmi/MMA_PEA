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

type ListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'List'>;

interface Props {
  navigation: ListScreenNavigationProp;
}

const GENRES: Genre[] = ['Action', 'Comedy', 'Drama', 'Horror'];
const STATUSES: MovieStatus[] = ['Plan to Watch', 'Watching', 'Watched'];

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

  // Đăng ký nhận dữ liệu phim thời gian thực từ Firestore
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

  // Validation Form thêm phim
  const getTitleError = () => {
    if (!hasSubmittedForm) return '';
    if (!title.trim()) return 'Title is required';
    if (title.length > 100) return 'Title must be at most 100 characters';
    return '';
  };

  const getDirectorError = () => {
    if (!hasSubmittedForm) return '';
    if (!director.trim()) return 'Director is required';
    if (director.length > 60) return 'Director must be at most 60 characters';
    return '';
  };

  const getGenreError = () => {
    if (!hasSubmittedForm) return '';
    if (!genre) return 'Please choose a genre';
    return '';
  };

  const getStatusError = () => {
    if (!hasSubmittedForm) return '';
    if (!status) return 'Please choose a status';
    return '';
  };

  const getRatingError = () => {
    if (!hasSubmittedForm) return '';
    if (rating.trim() === '') return '';
    // Kiểm tra số nguyên từ 0 đến 5
    const num = Number(rating.trim());
    if (!Number.isInteger(num) || num < 0 || num > 5 || isNaN(num)) {
      return 'Rating must be a whole number from 0 to 5';
    }
    return '';
  };

  const getNotesError = () => {
    if (!hasSubmittedForm) return '';
    if (notes.length > 300) return 'Notes must be at most 300 characters';
    return '';
  };

  const titleError = getTitleError();
  const directorError = getDirectorError();
  const genreError = getGenreError();
  const statusError = getStatusError();
  const ratingError = getRatingError();
  const notesError = getNotesError();

  // Xử lý thêm phim
  const handleAddMovie = async () => {
    setHasSubmittedForm(true);
    setMovieSuccess('');
    setMovieError('');

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

      // Thêm thành công
      setMovieSuccess('Movie added');
      // Xoá trắng Form
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

  // Toggle trạng thái yêu thích
  const handleToggleFavorite = async (movie: Movie) => {
    try {
      await movieService.toggleFavorite(movie.id, movie.favorite);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Lọc và Tìm kiếm phim (Tức thì, kết hợp tất cả các bộ lọc)
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      // Lọc Genre
      if (selectedGenreFilter !== 'All' && m.genre !== selectedGenreFilter) {
        return false;
      }
      // Lọc Status
      if (selectedStatusFilter !== 'All' && m.status !== selectedStatusFilter) {
        return false;
      }
      // Lọc Favorites Only
      if (favoritesOnly && !m.favorite) {
        return false;
      }
      // Lọc Tìm kiếm (Title hoặc Director, case-insensitive, bỏ khoảng trắng hai đầu)
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

    // Sắp xếp: Số lượng phim nhiều nhất lên đầu; nếu bằng nhau thì theo thứ tự Plan to Watch -> Watching -> Watched
    result.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return priority[a.status] - priority[b.status];
    });

    return result;
  }, [filteredMovies]);

  // Reset toàn bộ bộ lọc
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
        {/* Header với email người dùng và nút Logout */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>CineList</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* PHẦN A: FORM THÊM PHIM (testID="movie-form") */}
          <View testID="movie-form" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add a Movie</Text>

            {/* Thông báo thành công với testID="movie-success" */}
            {movieSuccess ? (
              <View style={styles.successBanner}>
                <Text testID="movie-success" style={styles.successBannerText}>
                  {movieSuccess}
                </Text>
              </View>
            ) : null}

            {/* Thông báo lỗi với testID="error-movie" */}
            {movieError ? (
              <View style={styles.errorBanner}>
                <Text testID="error-movie" style={styles.errorBannerText}>
                  {movieError}
                </Text>
              </View>
            ) : null}

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, titleError ? styles.inputInvalid : null]}
                placeholder="e.g. Inception"
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  setMovieSuccess('');
                  setMovieError('');
                }}
              />
              {titleError ? <Text style={styles.fieldErrorText}>{titleError}</Text> : null}
            </View>

            {/* Director */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Director *</Text>
              <TextInput
                style={[styles.input, directorError ? styles.inputInvalid : null]}
                placeholder="e.g. Christopher Nolan"
                placeholderTextColor="#64748b"
                value={director}
                onChangeText={(t) => {
                  setDirector(t);
                  setMovieSuccess('');
                  setMovieError('');
                }}
              />
              {directorError ? <Text style={styles.fieldErrorText}>{directorError}</Text> : null}
            </View>

            {/* Genre Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genre *</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.pickerChip, genre === '' ? styles.pickerChipActive : null]}
                  onPress={() => {
                    setGenre('');
                    setMovieSuccess('');
                    setMovieError('');
                  }}
                >
                  <Text style={[styles.pickerChipText, genre === '' ? styles.pickerChipTextActive : null]}>
                    Choose genre
                  </Text>
                </TouchableOpacity>
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pickerChip, genre === g ? styles.pickerChipActive : null]}
                    onPress={() => {
                      setGenre(g);
                      setMovieSuccess('');
                      setMovieError('');
                    }}
                  >
                    <Text style={[styles.pickerChipText, genre === g ? styles.pickerChipTextActive : null]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {genreError ? <Text style={styles.fieldErrorText}>{genreError}</Text> : null}
            </View>

            {/* Status Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.pickerChip, status === '' ? styles.pickerChipActive : null]}
                  onPress={() => {
                    setStatus('');
                    setMovieSuccess('');
                    setMovieError('');
                  }}
                >
                  <Text style={[styles.pickerChipText, status === '' ? styles.pickerChipTextActive : null]}>
                    Choose status
                  </Text>
                </TouchableOpacity>
                {STATUSES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.pickerChip, status === st ? styles.pickerChipActive : null]}
                    onPress={() => {
                      setStatus(st);
                      setMovieSuccess('');
                      setMovieError('');
                    }}
                  >
                    <Text style={[styles.pickerChipText, status === st ? styles.pickerChipTextActive : null]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {statusError ? <Text style={styles.fieldErrorText}>{statusError}</Text> : null}
            </View>

            {/* Rating */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rating (0 - 5, optional)</Text>
              <TextInput
                style={[styles.input, ratingError ? styles.inputInvalid : null]}
                placeholder="e.g. 5"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={rating}
                onChangeText={(t) => {
                  setRating(t);
                  setMovieSuccess('');
                  setMovieError('');
                }}
              />
              {ratingError ? <Text style={styles.fieldErrorText}>{ratingError}</Text> : null}
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (optional, max 300 chars)</Text>
              <TextInput
                style={[styles.textArea, notesError ? styles.inputInvalid : null]}
                placeholder="Personal thoughts or notes..."
                placeholderTextColor="#64748b"
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

            <TouchableOpacity
              style={[styles.addBtn, isAdding && styles.buttonDisabled]}
              onPress={handleAddMovie}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.addBtnText}>Add Movie</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* PHẦN C: FILTER, SEARCH VÀ SUMMARY */}
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.sectionTitle}>Filters & Search</Text>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or director..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Genre Filter */}
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

            {/* Status Filter */}
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

            {/* Favorites Only Switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Favorites only</Text>
              <Switch
                value={favoritesOnly}
                onValueChange={setFavoritesOnly}
                trackColor={{ false: '#334155', true: '#e11d48' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Summary Section */}
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

              {/* Status Breakdown Table */}
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
              <ActivityIndicator size="large" color="#e11d48" style={{ marginTop: 20 }} />
            ) : filteredMovies.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text testID="movies-empty" style={styles.emptyText}>
                  No movies found
                </Text>
              </View>
            ) : (
              <View style={styles.movieList}>
                {filteredMovies.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    testID="movie-item"
                    style={styles.movieCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Detail', { id: movie.id })}
                  >
                    <View style={styles.movieCardContent}>
                      <View style={styles.movieHeaderRow}>
                        <Text style={styles.movieTitle}>{movie.title}</Text>
                        <TouchableOpacity
                          style={styles.starBtn}
                          onPress={() => handleToggleFavorite(movie)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={[styles.starIcon, movie.favorite && styles.starIconActive]}>
                            {movie.favorite ? '★' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.movieDirector}>Directed by {movie.director}</Text>

                      <View style={styles.movieBadgesRow}>
                        <View style={styles.genreBadge}>
                          <Text style={styles.genreBadgeText}>{movie.genre}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>{movie.status}</Text>
                        </View>
                        {movie.rating !== null && movie.rating !== undefined ? (
                          <View style={styles.ratingBadge}>
                            <Text style={styles.ratingBadgeText}>⭐ {movie.rating}/5</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
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
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  successBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
  addBtn: {
    backgroundColor: '#e11d48',
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  filterCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  clearBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#f8fafc',
    backgroundColor: '#0f172a',
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
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
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#94a3b8',
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
    borderTopColor: '#334155',
    marginTop: 4,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  summaryBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#94a3b8',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
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
    color: '#cbd5e1',
  },
  breakdownCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  listSection: {
    marginBottom: 30,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  movieList: {
    gap: 12,
  },
  movieCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  movieCardContent: {},
  movieHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 24,
    color: '#64748b',
  },
  starIconActive: {
    color: '#facc15',
  },
  movieDirector: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 10,
  },
  movieBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60a5fa',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  ratingBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fde047',
  },
});
