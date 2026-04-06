import { http } from '../lib/http';
import type { AuthResponse, MessageResponse } from '../types/api';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterInput): Promise<MessageResponse> {
  const response = await http.post<MessageResponse>('/auth/register', payload);
  return response.data;
}

export async function loginUser(payload: LoginInput): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
