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

export const deleteAccount = async (password: string): Promise<void> => {
    // Axios delete accepts config as second argument, data is inside config
    await api.delete('/users/account', { data: { password } });
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};
