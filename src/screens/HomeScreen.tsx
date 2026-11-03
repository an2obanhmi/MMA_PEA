import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { AppButton, FeatureCard } from '../components';
import { COLORS } from '../constants/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user, loading } = useAuth();

  // Khi đã đăng nhập, tự động chuyển thẳng sang màn hình List
  useEffect(() => {
    if (!loading && user) {
      navigation.replace('List');
    }
  }, [user, loading, navigation]);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header với tên CineList và 2 nút Login / Register khi chưa đăng nhập */}
        <View style={styles.header}>
          <Text style={styles.headerAppName}>CineList</Text>
          <View style={styles.headerButtons}>
            <AppButton
              title="Login"
              variant="secondary"
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Login')}
            />
            <AppButton
              title="Register"
              variant="primary"
              style={styles.headerBtn}
              onPress={() => navigation.navigate('Register')}
            />
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text testID="home-title" style={styles.homeTitle}>
            CineList
          </Text>
          <Text style={styles.appDescription}>
            Your personal private movie watchlist. Track films you plan to watch, rate your all-time favorites, and organize by status and genre effortlessly.
          </Text>
        </View>

        {/* 3 Feature Cards */}
        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="🎬"
            title="Track what you watch"
            description="Keep a complete log of films with directors, genres, and personal notes."
          />
          <FeatureCard
            icon="📊"
            title="Sort by status"
            description="Organize seamlessly into Plan to Watch, Watching, and Watched."
          />
          <FeatureCard
            icon="⭐"
            title="Rate your favorites"
            description="Mark top picks as favorites and give star ratings from 0 to 5."
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <AppButton
            title="Get Started — Create Account"
            variant="primary"
            onPress={() => navigation.navigate('Register')}
          />
          <AppButton
            title="Already have an account? Sign In"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    marginBottom: 24,
  },
  headerAppName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    height: 38,
    paddingHorizontal: 14,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  homeTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  appDescription: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 360,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  ctaContainer: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 20,
  },
});
