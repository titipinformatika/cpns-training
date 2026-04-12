import api from './axios';
import type { ApiResponse, LoginResponse, User } from '../types';

export const authApi = {
  register: (data: { nama: string; email: string; password: string }) =>
    api.post<ApiResponse<User>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.put<ApiResponse<null>>('/auth/change-password', data),
};
