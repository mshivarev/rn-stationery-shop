const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export type AuthResponse = { email: string; token: string };
export type CodeSentResponse = { email: string; resendAfter: number };

async function post<T>(path: string, body: object): Promise<T> {
  if (!API_URL) {
    throw new Error('Не задан EXPO_PUBLIC_API_URL в файле .env');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Нет связи с сервером');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === 'string' ? detail : 'Ошибка сервера');
  }
  return data as T;
}

export const registerUser = (email: string, password: string) =>
  post<CodeSentResponse>('/auth/register', { email, password });

export const resendCode = (email: string) =>
  post<CodeSentResponse>('/auth/resend', { email });

export const verifyEmail = (email: string, code: string) =>
  post<AuthResponse>('/auth/verify', { email, code });

export const loginUser = (email: string, password: string) =>
  post<AuthResponse>('/auth/login', { email, password });
