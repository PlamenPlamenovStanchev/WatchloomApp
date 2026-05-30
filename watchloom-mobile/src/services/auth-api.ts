import { apiClient } from '@/lib/api-client';
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  UserResponse,
} from '@/types/api';

export function login(input: LoginInput) {
  return apiClient.post<LoginResponse>('/api/auth/login', input);
}

export function register(input: RegisterInput) {
  return apiClient.post<RegisterResponse>('/api/auth/register', input);
}

export function me(token: string) {
  return apiClient.get<UserResponse>('/api/auth/me', { token });
}
