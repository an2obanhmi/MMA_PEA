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
import { validateEmail, validatePassword } from '../utils/validation';
import { COLORS } from '../constants/theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const emailError = validateEmail(email, hasSubmitted);
  const passwordError = validatePassword(password, hasSubmitted, false);

  const handleLogin = async () => {
    setHasSubmitted(true);
    setAuthError('');

    if (validateEmail(email, true) || validatePassword(password, true, false)) {
      return;
    }

    setLoading(true);
    try {
      await firebaseAuth.login(email, password);
      navigation.replace('List');
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
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
            <Text style={styles.headerTitle}>Sign In</Text>
            <Text style={styles.subTitle}>Welcome back to CineList</Text>

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
              placeholder="Enter your password"
              isPassword
              value={password}
              error={passwordError}
              onChangeText={(text) => {
                setPassword(text);
                setAuthError('');
              }}
            />

            <AppButton
              title="Sign In"
              variant="primary"
              loading={loading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Register now</Text>
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
