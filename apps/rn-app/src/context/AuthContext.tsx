import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authApi, devicesApi, tokenStorage, AuthUser } from '../api/apiClient';
import { getFcmToken } from '../services/fcm.service';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login:  (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (phone: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await authApi.login(phone, password);
      tokenStorage.set(res.access_token);
      setState({ user: res.user, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, phone: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await authApi.register(name, phone, password);
      tokenStorage.set(res.access_token);
      setState({ user: res.user, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    // Best-effort unregister current FCM token so server stops pushing.
    try {
      const fcmToken = await getFcmToken();
      if (fcmToken) await devicesApi.unregister(fcmToken);
    } catch {
      // Token may already be invalid or server unreachable — proceed with logout.
    }
    tokenStorage.clear();
    setState({ user: null, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
