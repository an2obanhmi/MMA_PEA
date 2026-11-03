import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { firebaseAuth } from '../services/firebaseAuth';
import { AppInput, AppButton } from '../components';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validation';
import { COLORS } from '../constants/theme';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const emailError = validateEmail(email, hasSubmitted);
  const passwordError = validatePassword(password, hasSubmitted, true);
  const confirmPasswordError = validateConfirmPassword(confirmPassword, password, hasSubmitted);

  const handleRegister = async () => {
    setHasSubmitted(true);
    setAuthError('');
    setSuccessMessage('');

    if (
      validateEmail(email, true) ||
      validatePassword(password, true, true) ||
      validateConfirmPassword(confirmPassword, password, true)
    ) {
      return;
    }

    setLoading(true);
    try {
      await firebaseAuth.register(email, password);
      setSuccessMessage('Registration successful');
      setTimeout(() => {
        navigation.replace('List');
      }, 1200);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.subTitle}>Join CineList to organize your watchlist</Text>

            {/* testID="form-success" */}
            {successMessage ? (
              <View style={styles.successBox}>
                <Text testID="form-success" style={styles.successText}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* testID="error-auth" */}
            {authError ? (
              <View style={styles.errorBox}>
                <Text testID="error-auth" style={styles.errorText}>
                  {authError}
                </Text>
              </View>
            ) : null}

            <AppInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              error={emailError}
              onChangeText={(text) => {
                setEmail(text);
                setAuthError('');
              }}
            />

            <AppInput
              label="Password"
              placeholder="At least 6 characters"
              isPassword
              value={password}
              error={passwordError}
              onChangeText={(text) => {
                setPassword(text);
                setAuthError('');
              }}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              isPassword
              value={confirmPassword}
              error={confirmPasswordError}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setAuthError('');
              }}
            />

            <AppButton
              title="Register"
              variant="primary"
              loading={loading}
              onPress={handleRegister}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
