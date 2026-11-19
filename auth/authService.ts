import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { loginUser } from './api';

const TOKEN_KEY = 'auth_token';

export const FAKE_USER = {
  login: 'user',
  password: 'pharmacy123',
};

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function loginWithPassword(login: string, password: string): Promise<string> {
  const value = login.trim();

  if (!value.includes('@')) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (value === FAKE_USER.login && password === FAKE_USER.password) {
      return `fake-token-${Date.now()}`;
    }
    throw new Error('Неверный логин или пароль');
  }

  const { token } = await loginUser(value, password);
  return token;
}
