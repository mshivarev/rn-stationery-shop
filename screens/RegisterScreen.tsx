import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerUser } from '../auth/api';
import PasswordInput from '../components/PasswordInput';
import { authStyles as styles, PLACEHOLDER_COLOR } from '../components/authStyles';
import { usePreventScreenshots } from '../hooks/usePreventScreenshots';
import { AuthStackParamList } from '../types/navigation';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 6;

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  usePreventScreenshots();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && repeat.length > 0 && !submitting;

  const handleRegister = async () => {
    if (!canSubmit) return;
    const value = email.trim().toLowerCase();

    if (!EMAIL_RE.test(value)) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`);
      return;
    }
    if (password !== repeat) {
      setError('Пароли не совпадают');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await registerUser(value, password);
      navigation.navigate('VerifyEmail', { email: result.email, resendAfter: result.resendAfter });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось зарегистрироваться');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Мы отправим код подтверждения на вашу почту</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
        <PasswordInput
          placeholder={`Пароль (от ${MIN_PASSWORD_LENGTH} символов)`}
          value={password}
          onChangeText={setPassword}
          textContentType="newPassword"
          autoComplete="password-new"
        />
        <PasswordInput
          placeholder="Повторите пароль"
          value={repeat}
          onChangeText={setRepeat}
          textContentType="newPassword"
          autoComplete="password-new"
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, styles.primary, !canSubmit && styles.disabled]}
          onPress={handleRegister}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Получить код</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
