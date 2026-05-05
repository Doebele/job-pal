import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../stores/auth-store';
import type { AuthState } from '../stores/auth-store';

interface AuthContextValue {
  user: AuthState['user'] | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'employer') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, login: authLogin, register: authRegister, logout, isLoading } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, login: authLogin, register: authRegister, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
