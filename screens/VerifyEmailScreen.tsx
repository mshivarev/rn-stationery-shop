import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resendCode, verifyEmail } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { authStyles as styles, PLACEHOLDER_COLOR } from '../components/authStyles';
import { usePreventScreenshots } from '../hooks/usePreventScreenshots';
import { AuthStackParamList } from '../types/navigation';

const CODE_LENGTH = 6;

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({ route }: Props) {
  usePreventScreenshots();

  const { email, resendAfter } = route.params;
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(resendAfter);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const canSubmit = code.length === CODE_LENGTH && !submitting;

  const handleVerify = async () => {
    if (!canSubmit) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const { token } = await verifyEmail(email, code);
      await signIn(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось подтвердить код');
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const result = await resendCode(email);
      setCode('');
      setSecondsLeft(result.resendAfter);
      setInfo('Новый код отправлен');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить код');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Подтверждение</Text>
        <Text style={styles.subtitle}>Введите код из письма, отправленного на {email}</Text>

        <TextInput
          style={[styles.input, local.code]}
          placeholder="••••••"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleVerify}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {info && <Text style={local.info}>{info}</Text>}

        <Pressable
          style={[styles.button, styles.primary, !canSubmit && styles.disabled]}
          onPress={handleVerify}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Подтвердить</Text>
          )}
        </Pressable>

        <Pressable style={styles.link} onPress={handleResend} disabled={secondsLeft > 0 || resending}>
          <Text style={[styles.linkText, (secondsLeft > 0 || resending) && styles.linkDisabled]}>
            {secondsLeft > 0
              ? `Отправить код повторно через ${secondsLeft} с`
              : 'Отправить код повторно'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const local = StyleSheet.create({
  code: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  info: { color: '#2e7d32', fontSize: 14 },
});
