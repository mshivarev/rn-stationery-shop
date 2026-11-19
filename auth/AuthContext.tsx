import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, saveToken } from './authService';

type AuthContextValue = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then(setToken)
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await removeToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
