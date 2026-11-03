import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Movie } from '../types';
import { COLORS } from '../constants/theme';

interface MovieItemProps {
  movie: Movie;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const MovieItem: React.FC<MovieItemProps> = ({
  movie,
  onPress,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity
      testID="movie-item"
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <TouchableOpacity
          style={styles.starBtn}
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.starIcon, movie.favorite && styles.starIconActive]}>
            {movie.favorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.director} numberOfLines={1}>
        Directed by {movie.director}
      </Text>

      <View style={styles.badgesRow}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  starBtn: {
    padding: 2,
  },
  starIcon: {
    fontSize: 24,
    color: COLORS.starInactive,
  },
  starIconActive: {
    color: COLORS.star,
  },
  director: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  badgesRow: {
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
    color: COLORS.badgeAction,
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
    color: COLORS.badgeWatched,
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
    color: COLORS.star,
  },
});
