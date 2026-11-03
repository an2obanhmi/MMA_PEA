import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user, loading } = useAuth();

  // Khi đã đăng nhập thành công, tự động mở thẳng sang màn hình List
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
        {/* Header với tên ứng dụng và 2 nút Login / Register khi chưa đăng nhập */}
        <View style={styles.header}>
          <Text style={styles.headerAppName}>CineList</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerLoginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.headerLoginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerRegisterBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.headerRegisterText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phần nội dung chính */}
        <View style={styles.heroSection}>
          <Text testID="home-title" style={styles.homeTitle}>
            CineList
          </Text>
          <Text style={styles.appDescription}>
            Your personal private movie watchlist. Track films you plan to watch, rate your all-time favorites, and organize by status and genre effortlessly.
          </Text>
        </View>

        {/* 3 Thẻ tính năng (Feature Cards) theo yêu cầu đề thi */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎬</Text>
            <Text style={styles.featureTitle}>Track what you watch</Text>
            <Text style={styles.featureDesc}>
              Keep a complete log of films with directors, genres, and personal notes.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Sort by status</Text>
            <Text style={styles.featureDesc}>
              Organize seamlessly into Plan to Watch, Watching, and Watched.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureTitle}>Rate your favorites</Text>
            <Text style={styles.featureDesc}>
              Mark top picks as favorites and give star ratings from 0 to 5.
            </Text>
          </View>
        </View>

        {/* Nút hành động kêu gọi */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.ctaButtonText}>Get Started — Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaSecondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.ctaSecondaryText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 24,
  },
  headerAppName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLoginBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  headerLoginText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRegisterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#e11d48',
  },
  headerRegisterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  homeTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  appDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 360,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  ctaContainer: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSecondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
