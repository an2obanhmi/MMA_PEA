import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { firebaseAuth } from '../services/firebaseAuth';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await firebaseAuth.logout();
      Alert.alert('Đăng xuất', 'Bạn đã đăng xuất thành công.');
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng xuất.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.helloTitle}>Hello World!</Text>
        <Text style={styles.subtitle}>
          Chúc mừng bạn đã đăng ký / đăng nhập thành công vào hệ thống.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Tài khoản hiện tại:</Text>
          <Text style={styles.emailText}>{user?.email || 'Chưa xác định'}</Text>

          <Text style={styles.infoLabel}>User UID:</Text>
          <Text style={styles.uidText}>{user?.uid || 'N/A'}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('List')}
          >
            <Text style={styles.primaryButtonText}>📚 Xem Danh Sách Sách</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Đăng Xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 56,
    marginBottom: 12,
  },
  helloTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b6cb0',
  },
  uidText: {
    fontSize: 13,
    color: '#4a5568',
    fontFamily: 'monospace',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3182ce',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e53e3e',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#e53e3e',
    fontSize: 15,
    fontWeight: '700',
  },
});
