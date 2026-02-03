import api from './axios';
import { AuthUser } from '../types/auth';

export const updateProfile = async (payload: { name: string; username: string }): Promise<AuthUser> => {
    const { data } = await api.put<AuthUser>('/users/profile', payload);
    return data;
};

export const updatePassword = async (payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const { data } = await api.put<{ message: string }>('/users/password', payload);
    return data;
};

export const deleteAccount = async (): Promise<void> => {
    await api.delete('/users/account');
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};
