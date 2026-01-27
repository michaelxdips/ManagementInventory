import { createContext, useEffect, useMemo, useState } from 'react';
import { loginApi, logoutApi, meApi } from '../api/auth.api';
import { AuthUser, LoginPayload, Role } from '../types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    meApi()
      .then((me) => {
        if (mounted && me) setUser(me);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const loggedIn = await loginApi(payload);
      setUser(loggedIn);
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = useMemo(() => ({ user, loading: loading && !authChecked, login, logout, hasRole }), [user, loading, authChecked]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
