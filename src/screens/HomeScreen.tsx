import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
      Alert.alert('Thành công', 'Bạn đã đăng xuất.');
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng xuất.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Xin chào,</Text>
        <Text style={styles.emailText}>{user ? user.email : 'Khách'}</Text>
        <Text style={styles.badgeText}>
          {user ? 'Trạng thái: Đã đăng nhập' : 'Trạng thái: Chưa đăng nhập'}
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('List')}
        >
          <Text style={styles.actionButtonText}>Xem Danh Sách Sách</Text>
        </TouchableOpacity>

        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đi đến Đăng Nhập</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#697386',
  },
  emailText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1f36',
    marginTop: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#28a745',
    backgroundColor: '#e8f7ee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#eaecef',
    marginVertical: 20,
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#cf222e',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#cf222e',
    fontSize: 15,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
