import React, { useState, useEffect, useCallback } from 'react';

import { AuthContext, AuthContextType, User, useAuth } from './authCore';

export { useAuth };
export type { AuthContextType, User };


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mansoor_admin_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('mansoor_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [allowDevFallback, setAllowDevFallback] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setIsInitialized(Boolean(data.initialized));
        setAllowDevFallback(Boolean(data.allowDevFallback));
      }
    } catch (e) {
      console.warn('Unable to query auth status:', e);
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      await checkStatus();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const userObj: User | null = data.user || (data.id && data.username ? { id: data.id, username: data.username, email: data.email } : null);
          if (userObj) {
            setUser(userObj);
            localStorage.setItem('mansoor_admin_user', JSON.stringify(userObj));
          } else {
            localStorage.removeItem('mansoor_admin_token');
            localStorage.removeItem('mansoor_admin_user');
            setToken(null);
            setUser(null);
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('mansoor_admin_token');
          localStorage.removeItem('mansoor_admin_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify authentication token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, checkStatus]);

  const setupAdmin = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to initialize administrator account.' };
      }

      const userObj: User = data.user || { id: data.id, username: data.username, email: data.email };
      localStorage.setItem('mansoor_admin_token', data.token);
      localStorage.setItem('mansoor_admin_user', JSON.stringify(userObj));
      setToken(data.token);
      setUser(userObj);
      setIsInitialized(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during admin setup.' };
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
          setupRequired: Boolean(data.setupRequired),
        };
      }

      const userObj: User = data.user || { id: data.id, username: data.username, email: data.email };
      localStorage.setItem('mansoor_admin_token', data.token);
      localStorage.setItem('mansoor_admin_user', JSON.stringify(userObj));
      setToken(data.token);
      setUser(userObj);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('mansoor_admin_token');
    localStorage.removeItem('mansoor_admin_user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password update failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isInitialized,
        allowDevFallback,
        checkStatus,
        setupAdmin,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
