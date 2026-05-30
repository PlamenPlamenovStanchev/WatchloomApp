import { apiClient } from '@/lib/api-client';
import type { LoginInput, LoginResponse, RegisterInput, UserResponse } from '@/types/api';

export function login(input: LoginInput) {
  return apiClient.post<LoginResponse>('/api/auth/login', input);
}

export function register(input: RegisterInput) {
  return apiClient.post<UserResponse>('/api/auth/register', input);
}

export function me(token: string) {
  return apiClient.get<UserResponse>('/api/auth/me', { token });
}
