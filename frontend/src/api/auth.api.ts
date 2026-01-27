import api from './axios';
import { AuthUser, LoginPayload } from '../types/auth';

type LoginResponse = { user: AuthUser; token: string };

export const loginApi = async (payload: LoginPayload): Promise<AuthUser> => {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }
    return data.user;
  } catch (err) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    throw err;
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
};

export const meApi = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  } catch (err) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    return null;
  }
};
