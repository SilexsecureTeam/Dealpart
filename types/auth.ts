// types/auth.ts
import { User } from '@/types';

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  expires_at: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: User;
}

export interface VerifyCodeResponse {
  message: string;
  token: string;
  user: User;
}