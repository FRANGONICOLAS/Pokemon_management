import { createContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { loginUser, registerUser } from '../services/authApi';
import { clearAuthSession, loadAuthSession, saveAuthSession } from '../lib/storage';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

interface AuthContextValue {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = loadAuthSession();
    setToken(session.token);
    setEmail(session.email);
  }, []);

  async function login(input: LoginInput): Promise<void> {
    const response = await loginUser({
      email: input.email,
      password: input.password,
    });

    saveAuthSession(response.token, response.email, input.remember);
    setToken(response.token);
    setEmail(response.email);
  }

  async function register(input: RegisterInput): Promise<void> {
    await registerUser(input);
  }

  function logout(): void {
    clearAuthSession();
    setToken(null);
    setEmail(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [email, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
