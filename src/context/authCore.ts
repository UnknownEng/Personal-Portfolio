import { createContext, useContext } from 'react';

/**
 * Minimal auth state shared by the public site and the admin. Holds no login/setup code, so the
 * public bundle never ships it; the real AuthProvider lives in AuthContext.tsx (admin only).
 */

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  allowDevFallback: boolean;
  checkStatus: () => Promise<void>;
  setupAdmin: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; setupRequired?: boolean }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Signed-out stand-in used by the public site, which renders no AuthProvider:
 * visitors never call any /api/auth endpoint and never load admin code.
 */
const SIGNED_OUT: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true,
  allowDevFallback: false,
  checkStatus: async () => undefined,
  setupAdmin: async () => ({ success: false, error: 'Not available' }),
  login: async () => ({ success: false, error: 'Not available' }),
  logout: () => undefined,
  changePassword: async () => ({ success: false, error: 'Not available' }),
};

export const useAuth = (): AuthContextType => useContext(AuthContext) ?? SIGNED_OUT;
