import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { loginWithPassword } from '../auth/authService';
import PasswordInput from '../components/PasswordInput';
import { authStyles as styles, PLACEHOLDER_COLOR } from '../components/authStyles';
import { usePreventScreenshots } from '../hooks/usePreventScreenshots';
import { AuthStackParamList } from '../types/navigation';

WebBrowser.maybeCompleteAuthSession();

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '';

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function AuthScreen({ navigation }: Props) {
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
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Аптека</Text>
          <Text style={styles.subtitle}>Войдите, чтобы продолжить</Text>

          <TextInput
            style={styles.input}
            placeholder="Логин или email"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
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

          <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
