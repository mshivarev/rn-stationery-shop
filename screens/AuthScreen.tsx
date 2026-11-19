import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { loginWithPassword } from '../auth/authService';
import PasswordInput from '../components/PasswordInput';
import { usePreventScreenshots } from '../hooks/usePreventScreenshots';

WebBrowser.maybeCompleteAuthSession();

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '';

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

export default function AuthScreen() {
  usePreventScreenshots();

  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['read:user'],
      redirectUri: makeRedirectUri({ scheme: 'pharmacyshop', path: 'auth' }),
      responseType: ResponseType.Code,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === 'success') {
      signIn(`github-${response.params.code}`);
    } else if (response?.type === 'error') {
      Alert.alert('Ошибка входа через GitHub', response.error?.message ?? 'Попробуйте ещё раз');
    }
  }, [response]);

  const canSubmit = login.trim().length > 0 && password.length > 0 && !submitting;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const token = await loginWithPassword(login, password);
      await signIn(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось войти');
      setSubmitting(false);
    }
  };

  const handleGithub = () => {
    if (!GITHUB_CLIENT_ID) {
      Alert.alert('GitHub', 'Не задан EXPO_PUBLIC_GITHUB_CLIENT_ID в файле .env');
      return;
    }
    promptAsync();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Аптека</Text>
        <Text style={styles.subtitle}>Войдите, чтобы продолжить</Text>

        <TextInput
          style={styles.input}
          placeholder="Логин"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          autoComplete="username"
          returnKeyType="next"
        />
        <PasswordInput
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, styles.primary, !canSubmit && styles.disabled]}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Войти</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>или</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          style={[styles.button, styles.github, !request && styles.disabled]}
          onPress={handleGithub}
          disabled={!request}
        >
          <Ionicons name="logo-github" size={20} color="#fff" />
          <Text style={styles.buttonText}>Войти через GitHub</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: '#2e7d32' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { color: '#e53935', fontSize: 14 },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
  },
  primary: { backgroundColor: '#2e7d32', marginTop: 8 },
  github: { backgroundColor: '#24292e' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  line: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { color: '#999' },
});
